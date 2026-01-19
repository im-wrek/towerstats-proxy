import { NextRequest, NextResponse } from "next/server";
import LRUCache from "lru-cache";
import { chromium } from "playwright";

// Response cache
const cache = new LRUCache<string, any>({
  max: 200,
  ttl: 1000 * 60 * 5, // 5 min
});

export const GET = async (req: NextRequest, context: { params: { path: string[] } }) => {
  const path = context.params.path;
  
  // Your scraping / API logic here...
  const username = path[0]; 
  if (!username) return NextResponse.json({ error: "Missing username" });

  if (cache.has(username)) {
    return NextResponse.json(cache.get(username));
  }

  // Example: scrape towerstats for the user
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.towerstats.com/${username}`);
  const data = await page.$eval("#hardest-tower", el => el.textContent || "");
  await browser.close();

  const response = { hardestTower: data };
  cache.set(username, response);
  return NextResponse.json(response);
};
