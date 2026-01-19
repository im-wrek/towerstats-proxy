import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import LRUCache from "lru-cache";

const cache = new LRUCache<string, any>({ max: 100, ttl: 1000 * 60 * 5 }); // 5 min cache

export const runtime = "nodejs"; // Puppeteer cannot run in Edge

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const [tracker] = params.path;
    const url = `https://www.towerstats.com/${tracker}`;
    const username = new URL(req.url).searchParams.get("username");

    if (!username) {
      return NextResponse.json({ success: false, error: "Username required" });
    }

    const cacheKey = `${tracker}:${username}`;
    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`${url}?username=${encodeURIComponent(username)}`, { waitUntil: "domcontentloaded" });

    // Example scraping: grab hardest tower (update selectors based on towerstats DOM)
    const hardestTower = await page.evaluate(() => {
      const el = document.querySelector(".hardest-tower");
      if (!el) return null;
      return {
        name: el.querySelector(".name")?.textContent || "",
        color: el.querySelector(".color")?.textContent || "#000",
        extra: el.querySelector(".extra")?.textContent || ""
      };
    });

    await browser.close();

    const result = { success: true, hardestTower };
    cache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
