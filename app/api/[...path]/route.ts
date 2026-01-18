import { NextRequest, NextResponse } from "next/server";
import chromium from "chrome-aws-lambda";

export const runtime = "nodejs"; // default Node runtime

// Simple in-memory rate limiter
const rateLimitWindow = 60_000; // 1 minute
const maxRequests = 10;
const ipMap = new Map<string, { count: number; timestamp: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const ip = request.ip || "global"; // fallback if no IP
  const now = Date.now();
  const record = ipMap.get(ip) || { count: 0, timestamp: now };

  if (now - record.timestamp > rateLimitWindow) {
    record.count = 0;
    record.timestamp = now;
  }

  record.count += 1;
  ipMap.set(ip, record);

  if (record.count > maxRequests) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  const targetPath = params.path.join("/");
  const query = request.nextUrl.searchParams.toString();
  const targetUrl = `https://www.towerstats.com/${targetPath}${query ? `?${query}` : ""}`;

  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle2" });
    const html = await page.content();

    const hardestTower = extractHardestTower(html);

    return NextResponse.json({
      success: true,
      source: targetUrl,
      hardestTower,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Ultra-lean hardest tower extractor
 */
function extractHardestTower(html: string) {
  const start = html.indexOf('id="hardest-tower"');
  if (start === -1) return null;

  const divClose = html.indexOf("</div>", start);
  const divContent = html.slice(html.indexOf(">", start) + 1, divClose);

  const spanStart = divContent.indexOf("<span");
  const spanEnd = divContent.indexOf("</span>", spanStart);
  if (spanStart === -1 || spanEnd === -1) return null;

  const spanBlock = divContent.slice(spanStart, spanEnd + 7);

  const colorMatch = /color:\s*(#[0-9A-Fa-f]{3,6})/.exec(spanBlock);
  if (!colorMatch) return null;

  const name = spanBlock.slice(spanBlock.indexOf(">") + 1, spanBlock.lastIndexOf("<")).trim();
  const extra = (divContent.slice(0, spanStart) + divContent.slice(spanEnd + 7)).trim();

  return { name, color: colorMatch[1], extra };
}
