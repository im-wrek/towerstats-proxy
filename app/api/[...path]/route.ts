import { NextRequest, NextResponse } from "next/server";
import cheerio from "cheerio";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const parts = params.path || [];
  const tracker = parts[0];
  const username = request.nextUrl.searchParams.get("username");

  if (!tracker || !username) {
    return NextResponse.json({
      success: false,
      error: "Missing tracker or username",
    });
  }

  try {
    const url = `https://towerstats.com/${tracker}?username=${encodeURIComponent(username)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch TowerStats");

    const html = await res.text();

    const $ = cheerio.load(html);

    const name = $(".hardest-tower").text().trim(); // server HTML — may not exist
    const extra = $(".hardest-tower + *").text().trim();

    if (!name) {
      return NextResponse.json({
        success: false,
        error: "Hardest tower not found on server HTML",
        htmlSample: html.substring(0, 500), // small snippet for debugging
      });
    }

    return NextResponse.json({
      success: true,
      hardestTower: { name, extra },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
