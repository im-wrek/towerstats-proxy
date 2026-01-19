import { NextRequest, NextResponse } from "next/server"
import chromium from "@sparticuz/chromium"
import puppeteer, { Browser } from "puppeteer-core"
import LRU from "lru-cache"

export const runtime = "nodejs"

// ---- Cache
const cache = new LRU<string, any>({
  max: 300,
  ttl: 1000 * 60 * 10, // 10 minutes
})

// ---- Browser reuse (critical)
let browserPromise: Promise<Browser> | null = null

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })
  }
  return browserPromise
}

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username")
  if (!username) {
    return NextResponse.json(
      { error: "username required" },
      { status: 400 }
    )
  }

  const cacheKey = `hardest:${username}`
  const cached = cache.get(cacheKey)
  if (cached) return NextResponse.json(cached)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    page.setDefaultNavigationTimeout(8000)
    page.setDefaultTimeout(8000)

    await page.goto(
      `https://www.towerstats.com/user/${encodeURIComponent(username)}`,
      { waitUntil: "domcontentloaded" }
    )

    // Wait ONLY for what we need
    await page.waitForSelector("#hardesttower", {
      timeout: 5000,
    })

    const hardestTower = await page.$eval(
      "#hardesttower",
      el => el.textContent?.trim() ?? null
    )

    const result = { username, hardestTower }
    cache.set(cacheKey, result)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: "scrape failed" },
      { status: 500 }
    )
  } finally {
    await page.close()
  }
}
