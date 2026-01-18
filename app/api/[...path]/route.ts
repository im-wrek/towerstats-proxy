import { VercelRequest, VercelResponse } from "@vercel/node";
import chromium from "chrome-aws-lambda";

const BASE_URL = "https://www.towerstats.com";

// In-memory cache & rate-limit
const CACHE_TTL = 20000; // 20 seconds
const RATE_LIMIT_WINDOW = 60000; // 1 min
const RATE_LIMIT_MAX = 30;

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const cacheStore = new Map<string, { data: any; timestamp: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  // Rate limit
  const rateData = rateLimitStore.get(ip) || { count: 0, timestamp: now };
  if (now - rateData.timestamp > RATE_LIMIT_WINDOW) {
    rateData.count = 0;
    rateData.timestamp = now;
  }
  rateData.count++;
  rateLimitStore.set(ip, rateData);
  if (rateData.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ success: false, error: "Rate limit exceeded" });
  }

  // Parse path and username
  const path = (req.query.path as string[]) || ["etoh"];
  const tracker = path[0];
  const username = (req.query.username as string) || "";
  const cacheKey = `${tracker}:${username}`;

  // Return cached result if fresh
  const cached = cacheStore.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return res.json({ ...cached.data, cached: true });
  }

  const targetUrl = `${BASE_URL}/${tracker}${username ? `?username=${encodeURIComponent(username)}` : ""}`;

  try {
    // Launch Puppeteer
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    const html = await page.$eval("#hardest-tower", (el) => el.outerHTML).catch(() => null);
    await browser.close();

    let hardestTower = null;
    if (html) hardestTower = extractHardestTower(html);

    const result = { success: true, source: targetUrl, hardestTower };
    cacheStore.set(cacheKey, { data: result, timestamp: now });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Unknown error" });
  }
}

// Minimal extractor
function extractHardestTower(html: string) {
  // <div id="hardest-tower"><span style="color: #FFFE00;">ToM</span> (2.12) - Top 11.79%</div>
  const spanMatch = html.match(/<span[^>]*style="[^"]*color:\s*(#[0-9A-Fa-f]{3,6})[^"]*"[^>]*>([^<]+)<\/span>/);
  if (!spanMatch) return null;

  const color = spanMatch[1];
  const name = spanMatch[2].trim();
  const extra = html.replace(spanMatch[0], "").replace(/<\/?div[^>]*>/g, "").trim();

  return { name, color, extra };
}
