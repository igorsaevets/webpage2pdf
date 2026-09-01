import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const URL = 'https://krokit.org/courses/product/';
const OUT_DIR = path.resolve('D:/Hermes/webpage2pdf/.output/pdfs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const DESKTOP_W = 1920;
const DESKTOP_H = 1080;

console.log('launching Chrome...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});

const page = await browser.newPage();
await page.setViewport({ width: DESKTOP_W, height: DESKTOP_H, deviceScaleFactor: 1, isMobile: false });

console.log('goto', URL);
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await page.evaluate(() => document.fonts ? document.fonts.ready : true);
await new Promise(r => setTimeout(r, 800));

await page.evaluate(() => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading='eager'; try{i.src=i.src}catch{}});
  window.scrollTo(0, document.documentElement.scrollHeight);
});
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => window.scrollTo(0,0));
await new Promise(r => setTimeout(r, 400));

// 1) NAIVE A4 (mobile)
console.log('pdf naive A4 (mobile)...');
const naivePath = path.join(OUT_DIR, 'krokit-naive-A4-mobile.pdf');
await page.pdf({
  path: naivePath,
  format: 'A4',
  printBackground: true,
  margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
});

// 2) DESKTOP large-paper single page (screen + 1920)
console.log('pdf desktop large-paper (screen + 1920)...');
await page.emulateMediaType('screen');
const client = await page.target().createCDPSession();
await client.send('Emulation.setDeviceMetricsOverride', { width: DESKTOP_W, height: DESKTOP_H, deviceScaleFactor: 1, mobile: false, screenWidth: DESKTOP_W, screenHeight: DESKTOP_H });
await new Promise(r => setTimeout(r, 400));

const metrics = await client.send('Page.getLayoutMetrics');
const contentHeight = Math.ceil(metrics.cssContentSize.height);
console.log('contentHeight', contentHeight);
const paperWidth = DESKTOP_W / 96;
let paperHeight = Math.max(DESKTOP_H, contentHeight) / 96;
const MAX_H = 15000/96;
if (paperHeight > MAX_H) paperHeight = MAX_H;

const desktopPath = path.join(OUT_DIR, 'krokit-desktop-1920.pdf');
const res1 = await client.send('Page.printToPDF', {
  paperWidth,
  paperHeight,
  marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  printBackground: true,
  preferCSSPageSize: false,
  displayHeaderFooter: false,
  generateTaggedPDF: true,
});
fs.writeFileSync(desktopPath, Buffer.from(res1.data, 'base64'));
console.log('wrote', desktopPath, 'size', fs.statSync(desktopPath).size);

await client.send('Emulation.clearDeviceMetricsOverride');
await page.emulateMediaType(null);

// 3) DESKTOP scaled to A4
await page.emulateMediaType('screen');
await client.send('Emulation.setDeviceMetricsOverride', { width: DESKTOP_W, height: DESKTOP_H, deviceScaleFactor: 1, mobile: false, screenWidth: DESKTOP_W, screenHeight: DESKTOP_H });
await new Promise(r => setTimeout(r, 300));
const scaledPath = path.join(OUT_DIR, 'krokit-desktop-scaled-A4.pdf');
const scale = (8.27 - 0.79) * 96 / DESKTOP_W;
console.log('scale A4', scale);
const res2 = await client.send('Page.printToPDF', {
  paperWidth: 8.27, paperHeight: 11.69,
  marginTop: 0.4, marginBottom: 0.4, marginLeft: 0.4, marginRight: 0.4,
  printBackground: true,
  preferCSSPageSize: false,
  scale,
  displayHeaderFooter: false,
  generateTaggedPDF: true,
});
fs.writeFileSync(scaledPath, Buffer.from(res2.data, 'base64'));
console.log('wrote', scaledPath, 'size', fs.statSync(scaledPath).size);

await client.detach();
await browser.close();
console.log('DONE', OUT_DIR);
for (const f of [naivePath, desktopPath, scaledPath]) {
  console.log(f, fs.statSync(f).size, 'bytes');
}
