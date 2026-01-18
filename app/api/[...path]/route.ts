import { NextRequest, NextResponse } from "next/server";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const BASE_URL = "https://www.towerstats.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const targetPath = params.path.join("/");
  const query = request.nextUrl.searchParams.toString();
  const targetUrl = `${BASE_URL}/${targetPath}${query ? `?${query}` : ""}`;

  let browser: puppeteer.Browser | null = null;

  try {
    // Launch minimal headless browser
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle2" });

    // Extract hardest tower HTML
    const html = await page.$eval("#hardest-tower", (el) => el.outerHTML);

    const hardestTower = extractHardestTower(html);

    return NextResponse.json({
      success: true,
      source: targetUrl,
      hardestTower,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}

function extractHardestTower(html: string) {
  // Example: <div id="hardest-tower" style="display:block;"><span style="color:#FFFE00;">ToM</span> (2.12) - Top 11.79%</div>
  const colorMatch = /color:\s*(#[0-9A-Fa-f]{3,6})/.exec(html);
  const nameMatch = /<span[^>]*>(.*?)<\/span>/.exec(html);
  const extraMatch = /<\/span>(.*)<\/div>/.exec(html);

  if (!colorMatch || !nameMatch) return null;

  return {
    name: nameMatch[1].trim(),
    color: colorMatch[1],
    extra: extraMatch ? extraMatch[1].trim() : "",
  };
}
