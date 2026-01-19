import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

// Scraper function
async function getHardestTower(tracker: string, username: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const url = `https://www.towerstats.com/${tracker}?username=${username}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Wait for the hardest tower element
  await page.waitForSelector("#hardest-tower");

  const html = await page.locator("#hardest-tower").innerHTML();

  // Extract span color and tower name
  const spanMatch = html.match(/<span style="color:\s*(#[0-9A-Fa-f]{6});?\s*">(.*?)<\/span>/);
  const hex = spanMatch?.[1] || null;
  const tower = spanMatch?.[2] || null;

  // Extract remaining text
  const extraText = html.replace(/<span.*?<\/span>/, "").trim();

  await browser.close();

  return { hex, tower, extraText };
}

// API handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const tracker = searchParams.get("tracker");

  if (!username || !tracker) {
    return NextResponse.json({ error: "Missing username or tracker" }, { status: 400 });
  }

  try {
    const hardest_tower = await getHardestTower(tracker, username);
    return NextResponse.json({ hardest_tower });
  } catch (e) {
    console.error("Scrape failed:", e);
    return NextResponse.json({ error: "Failed to scrape TowerStats" }, { status: 500 });
  }
}
