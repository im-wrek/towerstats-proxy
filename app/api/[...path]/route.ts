import { NextRequest, NextResponse } from "next/server";
import { chromium as pwChromium } from "playwright-core";

async function getHardestTower(tracker: string, username: string) {
  const browser = await pwChromium.launch({ headless:true, args:['--no-sandbox','--disable-setuid-sandbox'] });
  const context = await browser.newContext({ viewport:{ width:1280, height:720 } });
  const page = await context.newPage();

  const url = `https://www.towerstats.com/${tracker}?username=${username}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 7000 });

  try {
    await page.waitForSelector("#hardest-tower", { timeout: 5000 });
    const html = await page.locator("#hardest-tower").innerHTML();

    const spanMatch = html.match(/<span style="color:\s*(#[0-9A-Fa-f]{6});?\s*">(.*?)<\/span>/);
    const hex = spanMatch?.[1] || null;
    const tower = spanMatch?.[2] || null;
    const extraText = html.replace(/<span.*?<\/span>/, "").trim();

    return { hex, tower, extraText };
  } catch {
    return { hex:null, tower:null, extraText:"Tower not found" };
  } finally {
    await browser.close();
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const tracker = searchParams.get("tracker");

  if (!username || !tracker) return NextResponse.json({ error:"Missing username or tracker" }, { status:400 });

  try {
    const hardest_tower = await getHardestTower(tracker, username);
    return NextResponse.json({ hardest_tower });
  } catch (e) {
    console.error("Scrape failed:", e);
    return NextResponse.json({ error:"Failed to scrape TowerStats" }, { status:500 });
  }
}
