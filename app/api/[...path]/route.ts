import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const cache = new LRUCache<string, { username: string; hardestTower: string }>({
  max: 200,
  ttl: 1000 * 60 * 10, // 10 minutes cache
});

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const tracker = params.path[0]; // dynamic tracker
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.trim();

  if (!username) return NextResponse.json({ success: false, error: "Missing username" });

  const cacheKey = `${tracker}:${username.toLowerCase()}`;
  if (cache.has(cacheKey)) return NextResponse.json({ success: true, ...cache.get(cacheKey) });

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath, // <- TS-safe
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const url = `https://www.towerstats.com/${tracker}?username=${encodeURIComponent(username)}`;
    await page.goto(url, { waitUntil: "networkidle0" });

    // scrape hardestTower from JS-rendered content
    const hardestTower = await page.evaluate(() => {
      // adjust selector according to towerstats HTML
      const el = document.querySelector(".hardest-tower");
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
