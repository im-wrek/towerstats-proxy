import { NextRequest, NextResponse } from "next/server";
import chromium from "chrome-aws-lambda";

const BASE_URL = "https://www.towerstats.com";

// In-memory cache & rate-limit
const CACHE_TTL = 20000; // 20 seconds
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30;

const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const cacheStore = new Map<string, { data: any; timestamp: number }>();

export const runtime = "edge"; // optional, keeps it serverless

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();

  // --- Rate limiting ---
  const rateData = rateLimitStore.get(ip) || { count: 0, timestamp: now };
  if (now - rateData.timestamp > RATE_LIMIT_WINDOW) {
    rateData.count = 0;
    rateData.timestamp = now;
  }
  rateData.count++;
  rateLimitStore.set(ip, rateData);

  if (rateData.count > RATE_LIMIT_MAX) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  // --- Parse path & query ---
  const path = params.path || ["etoh"];
  const tracker = path[0];
  const username = request.nextUrl.searchParams.get("username") || "";
  const cacheKey = `${tracker}:${username}`;

  // Return cached if fresh
  const cached = cacheStore.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  const targetUrl = `${BASE_URL}/${tracker}${username ? `?username=${encodeURIComponent(username)}` : ""}`;

  try {
    // --- Launch Puppeteer (chromium-aws-lambda) ---
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    // --- Extract hardest tower ---
    const html = await page.$eval("#hardest-tower", (el) => el.outerHTML).catch(() => null);
    await browser.close();

    const hardestTower = html ? extractHardestTower(html) : null;

    const result = { success: true, source: targetUrl, hardestTower };
    cacheStore.set(cacheKey, { data: result, timestamp: now });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// --- Minimal extractor ---
function extractHardestTower(html: string) {
  // <div id="hardest-tower"><span style="color: #FFFE00;">ToM</span> (2.12) - Top 11.79%</div>
  const spanMatch = html.match(/<span[^>]*style="[^"]*color:\s*(#[0-9A-Fa-f]{3,6})[^"]*"[^>]*>([^<]+)<\/span>/);
  if (!spanMatch) return null;

  const color = spanMatch[1];
  const name = spanMatch[2].trim();
  const extra = html.replace(spanMatch[0], "").replace(/<\/?div[^>]*>/g, "").trim();

  return { name, color, extra };
}
