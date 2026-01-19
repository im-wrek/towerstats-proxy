import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import cheerio from "cheerio";

export async function GET(request: NextRequest, { params }: any) {
  const pathParts = params.path || [];
  const tracker = pathParts[0];
  const username = request.nextUrl.searchParams.get("username");

  if (!tracker || !username) {
    return NextResponse.json({
      success: false,
      error: "Missing tracker or username",
    });
  }

  try {
    // Fetch the actual TowerStats page
    const url = `https://towerstats.com/${tracker}?username=${encodeURIComponent(
      username
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching towerstats");

    const html = await res.text();
    const $ = cheerio.load(html);

    // Query the "hardest tower" element
    const name = $('div[data-testid="hardest-tower"] .name').text().trim();
    const color = $('div[data-testid="hardest-tower"] .color')
      .css("color")
      ?.trim();
    const extra = $('div[data-testid="hardest-tower"] .extra').text().trim();

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Hardest tower not found",
      });
    }

    return NextResponse.json({
      success: true,
      source: url,
      hardestTower: { name, color, extra },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
