import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const cache = new LRUCache<string, { username: string; hardestTower: string }>({
  max: 200,
  ttl: 1000 * 60 * 10,
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean); // ["app", "api", "tracker", ...]
  const tracker = segments[2]; // whatever comes after /api/

  const username = url.searchParams.get("username")?.trim();
  if (!username) return NextResponse.json({ success: false, error: "Missing username" });

  const cacheKey = `${tracker}:${username.toLowerCase()}`;
  if (cache.has(cacheKey)) return NextResponse.json({ success: true, ...cache.get(cacheKey) });

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath, // must await
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    const page = await browser.newPage();
    const targetUrl = `https://www.towerstats.com/${tracker}?username=${encodeURIComponent(username)}`;
    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    const hardestTower = await page.evaluate(() => {
      const el = document.querySelector(".hardest-tower"); // adjust selector
      return el?.textContent?.trim() || "Unknown";
    });

    await browser.close();

    const result = { username, hardestTower };
    cache.set(cacheKey, result);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch data",
    });
  }
}
