import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import LRU from 'lru-cache';

// --- Rate Limit ---
const rateLimitMap = new Map<string, { count: number; last: number }>();
const MAX_REQUESTS = 30; // per IP
const WINDOW_MS = 60_000; // 1 min

function checkRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - record.last > WINDOW_MS) {
    record.count = 1;
    record.last = now;
  } else {
    record.count++;
  }
  rateLimitMap.set(ip, record);
  return record.count <= MAX_REQUESTS;
}

// --- Cache ---
const cache = new LRU<string, any>({
  max: 100,
  ttl: 30_000 // 30 seconds
});

// --- Extract tower data ---
async function getHardestTower(username: string, tracker: string) {
  const key = `${username}:${tracker}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: true
  });

  try {
    const page = await browser.newPage();
    await page.goto(`https://towerstats.com/${tracker}?player=${username}`, { waitUntil: 'networkidle2' });

    const towerData = await page.evaluate(() => {
      const el = document.querySelector('#hardest-tower');
      if (!el) return null;
      const span = el.querySelector('span');
      return {
        name: span?.textContent ?? '',
        color: span?.getAttribute('style')?.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? '#FFF',
        extra: el.textContent?.replace(span?.textContent ?? '', '').trim() ?? ''
      };
    });

    cache.set(key, towerData);
    return towerData;
  } finally {
    await browser.close();
  }
}

// --- API handler ---
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || '';
  const tracker = searchParams.get('tracker') || 'etoh';

  if (!username) return NextResponse.json({ success: false, error: 'Missing username' }, { status: 400 });

  try {
    const hardestTower = await getHardestTower(username, tracker);
    if (!hardestTower) return NextResponse.json({ success: false, error: 'Tower not found' });
    return NextResponse.json({ success: true, hardestTower });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message });
  }
}
