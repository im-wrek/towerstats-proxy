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
  hardestTower?: HardestTower | null;
  error?: string;
}

const cache = new LRU<string, TowerStatsResponse>({
  max: 200,
  ttl: 1000 * 60 * 5, // 5 min
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await ctx.params; // <— await this
    const tracker = path[0];            // first segment is tracker
    const username = req.nextUrl.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ success: false, error: "Missing username" });
    }

    const cacheKey = `${tracker}:${username.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(
      `https://www.towerstats.com/${tracker}?username=${encodeURIComponent(username)}`,
      { waitUntil: "domcontentloaded" }
    );

    const hardestTower = await page.evaluate(() => {
      const el = document.querySelector(".hardest-tower");
      if (!el) return null;

      const name = el.textContent?.trim() || "";
      const extra = el.nextElementSibling?.textContent?.trim() || "";
      const color = window.getComputedStyle(el).color.toString();

      return { name, color, extra };
    });

    await browser.close();

    const result: TowerStatsResponse = {
      success: true,
      hardestTower,
    };

    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "Unknown error",
    });
  }
}
