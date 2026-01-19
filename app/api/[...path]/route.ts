import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache"; // ✅ named import
import { chromium } from "playwright";

type TowerStatsResponse = {
  hardestTower?: string;
  // other fields...
};

// Cache setup
const cache = new LRUCache<string, TowerStatsResponse>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { params } = await context; // await here fixes the type mismatch
  const path = params.path;

  try {
    // Your scraping logic here
    const cached = cache.get(path.join("/"));
    if (cached) return NextResponse.json(cached);

    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.towerstats.com/${path.join("/")}`);
    
    const hardestTower = await page.locator("#hardest-tower").textContent();
    await browser.close();

    const data: TowerStatsResponse = { hardestTower };
    cache.set(path.join("/"), data);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tower stats" }, { status: 500 });
  }
};
