// Erzeugt alle App-Grafiken für Luzidio aus SVG (Aufruf: node scripts/generate-icons.mjs).
// Benötigt Playwright + Chromium (nur zur Entwicklungszeit).
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Mondsichel: großer Kreis minus versetzter Kreis, dazu ein vierzackiger Stern.
const moon = (fill, cx = 0, cy = 0) => `
  <mask id="cut${fill.replace('#', '')}">
    <rect x="-600" y="-600" width="1200" height="1200" fill="white"/>
    <circle cx="${cx + 95}" cy="${cy - 70}" r="225" fill="black"/>
  </mask>
  <circle cx="${cx}" cy="${cy}" r="260" fill="${fill}" mask="url(#cut${fill.replace('#', '')})"/>`;
const sparkle = (fill, x, y, s) =>
  `<path transform="translate(${x} ${y}) scale(${s})" fill="${fill}" d="M0,-100 C8,-22 22,-8 100,0 C22,8 8,22 0,100 C-8,22 -22,8 -100,0 C-22,-8 -8,-22 0,-100 Z"/>`;
const smallStars = (fill) =>
  [[-300, -330, 6], [320, 300, 5], [-360, 200, 4], [260, -380, 4], [-150, 380, 5], [380, -120, 3]]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="0.8"/>`)
    .join('');

const glyph = (moonFill, starFill, scale = 1) =>
  `<g transform="scale(${scale})">${moon(moonFill, -30, 20)}${sparkle(starFill, 150, -60, 0.95)}${sparkle(starFill, 235, 95, 0.4)}</g>`;

const bg = `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2A2470"/>
      <stop offset="0.55" stop-color="#151A4A"/>
      <stop offset="1" stop-color="#0B1026"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.45" cy="0.48" r="0.5">
      <stop offset="0" stop-color="#8B7CF6" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#8B7CF6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="-512" y="-512" width="1024" height="1024" fill="url(#sky)"/>
  <rect x="-512" y="-512" width="1024" height="1024" fill="url(#glow)"/>`;

const svg = (size, inner, transparent = true) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
  viewBox="-512 -512 1024 1024" style="background:${transparent ? 'transparent' : '#0B1026'}">${inner}</svg>`;

const assets = [
  ['icon.png', 1024, svg(1024, bg + smallStars('#FFFFFF') + glyph('#F2C879', '#FFFFFF', 1.05), false)],
  ['android-icon-background.png', 512, svg(512, bg + smallStars('#FFFFFF'), false)],
  ['android-icon-foreground.png', 512, svg(512, glyph('#F2C879', '#FFFFFF', 0.72))],
  ['android-icon-monochrome.png', 432, svg(432, glyph('#FFFFFF', '#FFFFFF', 0.72))],
  ['splash-icon.png', 1024, svg(1024, glyph('#F2C879', '#FFFFFF', 1.1))],
  ['notification-icon.png', 96, svg(96, glyph('#FFFFFF', '#FFFFFF', 1.15))],
  ['favicon.png', 48, svg(48, bg + glyph('#F2C879', '#FFFFFF', 1.05), false)],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size, markup] of assets) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${markup}</body></html>`);
  const buf = await page.locator('svg').screenshot({ omitBackground: true });
  writeFileSync(join(root, 'assets', name), buf);
  console.log('geschrieben:', name);
}
await browser.close();
