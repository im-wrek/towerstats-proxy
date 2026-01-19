import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { chromium } from "playwright";

type TowerStatsResponse = {
  username: string;
  hardestTower?: string;
};

// Cache for responses (5 minutes)
const cache = new LRUCache<string, TowerStatsResponse>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const username = params.path[0];

  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

  // Check cache
  const cached = cache.get(username);
  if (cached) return NextResponse.json(cached);

  // Launch headless Chromium (Vercel-compatible)
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(`https://www.towerstats.com/${username}`, { waitUntil: "domcontentloaded" });

  // Scrape the "hardest-tower" element
  const hardestTower = await page.locator("#hardest-tower").textContent();

  await browser.close();

  const response: TowerStatsResponse = { username, hardestTower: hardestTower?.trim() || null };
  cache.set(username, response);

  return NextResponse.json(response);
}
