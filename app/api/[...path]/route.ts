import { NextRequest, NextResponse } from "next/server";
import * as LRU from "lru-cache";
import { chromium } from "playwright-core";

interface HardestTower {
  name: string;
  color: string;
  extra: string;
}

interface TowerStatsResponse {
  success: boolean;
  hardestTower?: HardestTower;
  error?: string;
}

const cache = new LRU<string, TowerStatsResponse>({ max: 100 });

export async function GET(
  req: NextRequest,
  { params }: { params: { tracker: string[] } }
) {
  const tracker = params.tracker[0];
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ success: false, error: "Missing username" });
  }

  const cacheKey = `${tracker}-${username}`;
  const cached = cache.get(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.towerstats.com/${tracker}?username=${username}`);
    
    // Simplified scraping
    const hardestTower = await page.evaluate(() => {
      const el = document.querySelector(".hardest-tower");
      if (!el) return null;
      return {
        name: el.textContent || "",
        color: "#FFFE00",
        extra: "(scraped)"
      };
    });

    await browser.close();

    if (!hardestTower)
      return NextResponse.json({ success: true, hardestTower: null });

    const result: TowerStatsResponse = { success: true, hardestTower };
    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
