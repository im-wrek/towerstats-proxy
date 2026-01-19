// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import LRU from "lru-cache";

interface HardestTower {
  name: string;
  color: string;
  extra: string;
}

interface TowerStatsResponse {
  success: boolean;
  source?: string;
  hardestTower?: HardestTower | null;
  error?: string;
}

// Simple in-memory cache
const cache = new LRU<string, TowerStatsResponse>({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export const runtime = "nodejs" // instead of "edge"

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const tracker = params.path[0];
    const username = req.nextUrl.searchParams.get("username");

    if (!tracker || !username) {
      return NextResponse.json({ success: false, error: "Missing tracker or username" });
    }

    const cacheKey = `${tracker}:${username}`;
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);

    // Launch puppeteer using sparticuz Chromium
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const url = `https://www.towerstats.com/${tracker}?username=${encodeURIComponent(username)}`;
    await page.goto(url, { waitUntil: "networkidle2" });

    // Evaluate the page and extract the hardest tower
    const hardestTower: HardestTower | null = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".hardest-tower");
      if (!el) return null;

      const name = el.querySelector(".tower-name")?.textContent?.trim() || "";
      const color = el.querySelector(".tower-name")?.getAttribute("style")?.match(/color:\s*(.*?);/)?.[1] || "#000";
      const extra = el.querySelector(".tower-extra")?.textContent?.trim() || "";

      return { name, color, extra };
    });

    await browser.close();

    const result: TowerStatsResponse = {
      success: true,
      source: url,
      hardestTower,
    };

    cache.set(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
