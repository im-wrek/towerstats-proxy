import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda"; // Vercel-friendly Chromium

type TowerStatsResponse = {
  username: string;
  hardestTower: string;
};

// Cache for 5 minutes
const cache = new LRUCache<string, TowerStatsResponse>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const [tracker, username] = params.path;

    if (!tracker || !username) {
      return NextResponse.json(
        { success: false, error: "Missing tracker or username" },
        { status: 400 }
      );
    }

    const cacheKey = `${tracker}-${username}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    // Launch Chromium in Vercel Edge-compatible mode
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const url = `https://www.towerstats.com/${tracker}?username=${username}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Pull hardestTower from the JS-rendered content
    const hardestTower = await page.evaluate(() => {
      const el = document.querySelector(".hardest-tower");
      return el?.textContent?.trim() || "Unknown";
    });

    await browser.close();

    const result: TowerStatsResponse = { username, hardestTower };
    cache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || err });
  }
}
