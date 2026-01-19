import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { chromium } from "playwright";

type TowerStatsResponse = {
  hardestTower: string;
  // add other fields as needed
};

// Response cache
const cache = new LRUCache<string, TowerStatsResponse>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const username = params.path[0];
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

  // Return cached response if available
  if (cache.has(username)) {
    return NextResponse.json(cache.get(username)!);
  }

  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.towerstats.com/profile/${username}`);
    await page.waitForSelector("#hardest-tower", { timeout: 5000 });

    const hardestTower = await page.$eval("#hardest-tower", el => el.textContent?.trim() || "");
    await browser.close();

    const result: TowerStatsResponse = { hardestTower };
    cache.set(username, result);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
