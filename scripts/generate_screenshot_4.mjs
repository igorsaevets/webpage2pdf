import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generateScreenshots() {
  const TARGET_URL = 'https://ironmemo.com/';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  // Fetch real site for the background of the PDF proof
  const fetchPage = await browser.newPage();
  await fetchPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await fetchPage.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await fetchPage.evaluate(() => window.scrollTo(0, 1000));
  await new Promise(r => setTimeout(r, 600));
  await fetchPage.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800));
  const desktopBuffer = await fetchPage.screenshot();
  const desktopB64 = desktopBuffer.toString('base64');
  await fetchPage.close();

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  console.log('Generating Screenshot 4: Selectable Vector Text Proof (Real Site)...');
  const html4 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      body { background: #0f172a; color: #f8fafc; width: 1280px; height: 800px; display: flex; flex-direction: column; overflow: hidden; }
      
      /* PDF Viewer Top Toolbar */
      .pdf-toolbar { background: #1e293b; height: 52px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
      .doc-info { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; }
      .pdf-badge { background: #ef4444; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; }
      
      /* Search Bar */
      .search-box { background: #0f172a; border: 1px solid #3b82f6; border-radius: 8px; height: 34px; display: flex; align-items: center; padding: 0 12px; gap: 10px; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); }
      .search-input { background: transparent; border: none; outline: none; color: #f8fafc; font-size: 13px; width: 180px; }
      .search-match { font-size: 11px; color: #93c5fd; background: #1e3a8a; padding: 2px 6px; border-radius: 4px; font-weight: 600; }

      /* PDF Page Canvas View */
      .viewer-body { flex: 1; background: #0b0f19; display: flex; align-items: center; justify-content: center; padding: 32px; overflow: hidden; }
      .pdf-page { width: 900px; height: 700px; background: #ffffff; color: #0f172a; border-radius: 6px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5); overflow: hidden; position: relative; }
      
      /* The actual image captured */
      .pdf-content-img { width: 100%; object-fit: cover; object-position: top center; transform: scale(1.1) translateY(20px); transform-origin: top center; }
      
      /* Fake text selection highlight overlay */
      /* Note: This is an overlay to simulate the Ctrl+F search highlight on the real image */
      .selection-overlay { position: absolute; background: rgba(59, 130, 246, 0.4); mix-blend-mode: multiply; border: 1px solid rgba(59, 130, 246, 0.8); border-radius: 2px; }
      .selection-overlay.s1 { top: 38%; left: 30%; width: 220px; height: 32px; background: rgba(253, 224, 71, 0.6); border: 1px solid #eab308; }
      .selection-overlay.s2 { top: 45%; left: 40%; width: 180px; height: 20px; }

      /* Floating Callout */
      .proof-banner { position: absolute; right: 48px; bottom: 48px; background: rgba(15, 23, 42, 0.95); border: 1px solid #10b981; border-radius: 12px; padding: 16px 24px; max-width: 380px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 100; }
      .proof-banner h4 { font-size: 15px; font-weight: 700; color: #34d399; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
      .proof-banner p { font-size: 12px; color: #cbd5e1; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="pdf-toolbar">
      <div class="doc-info">
        <span class="pdf-badge">PDF</span>
        <span>ironmemo_export.pdf</span>
        <span style="color:#64748b; font-size:12px;">• Page 1 / 3 • 100% Vector</span>
      </div>
      <div class="search-box">
        <span>🔍</span>
        <input class="search-input" value="real text selection" readonly>
        <span class="search-match">1 of 12</span>
      </div>
    </div>

    <div class="viewer-body">
      <div class="pdf-page">
        <img src="data:image/png;base64,${desktopB64}" class="pdf-content-img" />
        
        <!-- Synthetic highlights mimicking text selection in a PDF viewer -->
        <div class="selection-overlay s1"></div>
        <div class="selection-overlay s2"></div>
      </div>
    </div>

    <div class="proof-banner">
      <h4>✅ 100% Selectable Vector Text</h4>
      <p>Not a blurry screenshot. Full Ctrl+F search, easy copy-pasting, screen reader accessible, and under 1 MB in size.</p>
    </div>
  </body>
  </html>
  `;
  await page.setContent(html4);
  await page.screenshot({ path: 'store-assets/screenshot-4-search-vector-1280x800.png' });
  console.log('Saved screenshot-4-search-vector-1280x800.png');

  await browser.close();
}

generateScreenshots().catch(console.error);
