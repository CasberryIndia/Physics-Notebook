// Renders og-image.html at 1200x628 and saves to assets/og-image.{png,jpg}
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 628 });

  const htmlPath = path.resolve(__dirname, 'og-image-template.html');
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });

  // Wait for fonts to fully load
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const pngPath = path.resolve(__dirname, '../assets/og-image.png');
  const jpgPath = path.resolve(__dirname, '../assets/og-image.jpg');

  await page.screenshot({ path: pngPath, type: 'png', fullPage: false });
  await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 94, fullPage: false });

  await browser.close();

  const pngKB = Math.round(fs.statSync(pngPath).size / 1024);
  const jpgKB = Math.round(fs.statSync(jpgPath).size / 1024);
  console.log(`PNG: ${pngKB} KB  |  JPEG: ${jpgKB} KB`);
  console.log('Done — og-image.png and og-image.jpg written.');
})();
