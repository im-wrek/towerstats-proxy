import { NextRequest, NextResponse } from "next/server";
import { LRUCache } from "lru-cache";
import { chromium } from "playwright";

// Response cache
const cache = new LRUCache<string, any>({
  max: 200,
  ttl: 1000 * 60 * 5 // 5 minutes
});

// Dynamic TowerStats scraper
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const tracker = params.path.join("/");

  if (cache.has(tracker)) return NextResponse.json(cache.get(tracker));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.towerstats.com/${tracker}`, { waitUntil: "domcontentloaded" });

  // Grab hardest-tower dynamically
  const data = await page.evaluate(() => {
    const el = document.querySelector("#hardest-tower");
    return el ? el.textContent : null;
  });

  await browser.close();

  const response = { tracker, hardestTower: data || "N/A" };
  cache.set(tracker, response);
  return NextResponse.json(response);
}
