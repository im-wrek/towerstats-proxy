import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache"; // ✅ default import works now
import { chromium } from "playwright";

type TowerStatsResponse = {
  username: string;
  score: number;
  rank: number;
};

// Simple in-memory cache
const cache = new LRUCache<string, TowerStatsResponse>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  // ✅ Await the params promise properly
  const resolvedParams = await context.params;
  const path = resolvedParams.path;

  const username = path[0];
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  if (cache.has(username)) {
    return NextResponse.json(cache.get(username)!);
  }

  try {
    // Example scraping logic
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.towerstats.com/${username}`);
    const data = {
      username,
      score: 1234,
      rank: 42,
    };
    await browser.close();

    cache.set(username, data);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
