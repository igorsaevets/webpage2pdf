import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generateScreenshots() {
  const TARGET_URL = 'https://ironmemo.com/';
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  console.log(`Fetching real site screens for ${TARGET_URL}...`);
  const fetchPage = await browser.newPage();
  
  // Capture Desktop (webpage2pdf)
  await fetchPage.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await fetchPage.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  // Ensure lazy images load for a better screenshot, then scroll back to top
  await fetchPage.evaluate(() => window.scrollTo(0, 1000));
  await new Promise(r => setTimeout(r, 600));
  await fetchPage.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800)); // wait for smooth scroll to finish and top video to render
  
  const desktopBuffer = await fetchPage.screenshot();
  const desktopB64 = desktopBuffer.toString('base64');

  // Capture Mobile (Native Chrome Print)
  await fetchPage.setViewport({ width: 740, height: 1080, deviceScaleFactor: 1 });
  await fetchPage.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await fetchPage.evaluate(() => window.scrollTo(0, 1000));
  await new Promise(r => setTimeout(r, 600));
  await fetchPage.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800));
  
  const mobileBuffer = await fetchPage.screenshot();
  const mobileB64 = mobileBuffer.toString('base64');
  await fetchPage.close();

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });

  // ─────────────────────────────────────────────────────────────
  // 1. Screenshot 1: Hero - Popup over Desktop Webpage
  // ─────────────────────────────────────────────────────────────
  console.log('Generating Screenshot 1: Popup over Desktop Page...');
  const html1 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      body { background: #0b0f19; color: #f3f4f6; width: 1280px; height: 800px; overflow: hidden; position: relative; }
      
      /* Browser Header */
      .browser-bar { background: #161e2e; height: 42px; display: flex; align-items: center; padding: 0 16px; border-bottom: 1px solid #283548; gap: 12px; }
      .dots { display: flex; gap: 6px; }
      .dot { width: 11px; height: 11px; border-radius: 50%; }
      .dot.r { background: #ef4444; } .dot.y { background: #f59e0b; } .dot.g { background: #10b981; }
      .url-bar { background: #0b0f19; border: 1px solid #283548; border-radius: 6px; height: 26px; flex: 1; display: flex; align-items: center; padding: 0 12px; font-size: 12px; color: #9ca3af; }
      
      /* Webpage Content */
      .page-content { height: 758px; background: #0f172a; overflow: hidden; display: flex; align-items: flex-start; }
      .real-screenshot { width: 100%; height: auto; object-fit: contain; object-position: top center; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5)); opacity: 0.95; }
      
      /* Extension Popup Mock */
      .popup-wrapper { position: absolute; top: 50px; right: 48px; width: 340px; background: #0f0f12; border: 1px solid #2a2a33; border-radius: 14px; padding: 18px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(124, 92, 240, 0.4); z-index: 100; }
      .pop-title { font-size: 15px; font-weight: 700; display: flex; gap: 8px; align-items: center; color: #e8e8ec; }
      .pop-badge { font-size: 10px; background: #2a2a33; border: 1px solid #2a2a33; padding: 2px 7px; border-radius: 999px; color: #a78bfa; font-weight: 600; }
      .pop-sub { color: #9aa0a6; font-size: 12px; margin: 6px 0 16px; line-height: 1.4; }
      .pop-btn { width: 100%; background: #7c5cf0; color: white; border: 0; border-radius: 10px; padding: 12px 14px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(124, 92, 240, 0.4); display: flex; align-items: center; justify-content: center; gap: 8px; }
      .pop-hint { font-size: 11px; color: #9aa0a6; margin-top: 12px; line-height: 1.4; }
      .pop-row { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 12px; border-top: 1px solid #2a2a33; font-size: 12px; }
      .pop-link { color: #a78bfa; text-decoration: none; }
      
      /* Callout Banner */
      .badge-banner { position: absolute; bottom: 32px; left: 48px; background: rgba(15, 23, 42, 0.95); border: 1px solid #3b82f6; backdrop-filter: blur(8px); border-radius: 12px; padding: 16px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); z-index: 100; }
      .badge-icon { width: 36px; height: 36px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .badge-text h3 { font-size: 15px; font-weight: 700; color: #ffffff; }
      .badge-text p { font-size: 12px; color: #93c5fd; margin-top: 2px; }
    </style>
  </head>
  <body>
    <div class="browser-bar">
      <div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
      <div class="url-bar">🔒 ${TARGET_URL}</div>
    </div>
    
    <div class="page-content">
      <img src="data:image/png;base64,${desktopB64}" class="real-screenshot" />
    </div>

    <div class="popup-wrapper">
      <div class="pop-title">📄 webpage2pdf <span class="pop-badge">desktop</span></div>
      <div class="pop-sub">Save this page as a desktop-layout PDF with selectable text.</div>
      <button class="pop-btn">⚡ Save as PDF (desktop)</button>
      <div class="pop-hint">✓ 1920px Full HD Viewport Emulation<br>✓ Real Vector Text Layer (Searchable)</div>
      <div class="pop-row">
        <span class="pop-link">⚙️ Options (A4 / Letter)</span>
        <span class="pop-link">📁 Downloads</span>
      </div>
    </div>

    <div class="badge-banner">
      <div class="badge-icon">📄</div>
      <div class="badge-text">
        <h3>1-Click Desktop PDF Generation</h3>
        <p>Preserves 1920px multi-column layout, selectable text, and clean URL footer.</p>
      </div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(html1);
  await page.screenshot({ path: 'store-assets/screenshot-1-popup-1280x800.png' });
  console.log('Saved screenshot-1-popup-1280x800.png');

  // ─────────────────────────────────────────────────────────────
  // 2. Screenshot 2: Side-by-Side Before vs After
  // ─────────────────────────────────────────────────────────────
  console.log('Generating Screenshot 2: Before vs After...');
  const html2 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      body { background: #090d16; color: #f3f4f6; width: 1280px; height: 800px; padding: 36px 48px; display: flex; flex-direction: column; justify-content: space-between; }
      
      .header { text-align: center; margin-bottom: 24px; }
      .header h1 { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
      .header p { font-size: 15px; color: #94a3b8; margin-top: 6px; }

      .compare-container { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; min-height: 0; }
      
      .pane { background: #111827; border-radius: 16px; border: 1px solid #1f2937; padding: 24px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
      .pane.bad { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 10px 30px -10px rgba(239, 68, 68, 0.15); }
      .pane.good { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.2); }
      
      .pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #1f2937; }
      .pane-title { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
      .tag { font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 700; }
      .tag.bad { background: #450a0a; color: #f87171; border: 1px solid #991b1b; }
      .tag.good { background: #064e3b; color: #34d399; border: 1px solid #065f46; }

      .screenshot-wrap { flex: 1; border-radius: 8px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); position: relative; display: flex; align-items: flex-start; background: #0b0f19; }
      .screenshot-wrap img { width: 100%; height: auto; display: block; object-fit: contain; object-position: top center; }
      
      .overlay-warning { position: absolute; bottom: 16px; left: 16px; right: 16px; background: rgba(153, 27, 27, 0.9); color: white; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #ef4444; backdrop-filter: blur(4px); }
      .overlay-success { position: absolute; bottom: 16px; left: 16px; right: 16px; background: rgba(6, 78, 59, 0.9); color: white; padding: 12px; border-radius: 8px; font-size: 12px; font-weight: 600; text-align: center; border: 1px solid #10b981; backdrop-filter: blur(4px); }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>The Responsive Print Problem & Fix</h1>
      <p>Chrome's native print collapses pages into mobile view. webpage2pdf preserves the full desktop experience.</p>
    </div>

    <div class="compare-container">
      <div class="pane bad">
        <div class="pane-header">
          <div class="pane-title">❌ Chrome "Save as PDF"</div>
          <span class="tag bad">~740px Mobile Breakpoint</span>
        </div>
        <div class="screenshot-wrap">
          <img src="data:image/png;base64,${mobileB64}">
          <div class="overlay-warning">⚠️ Collapsed into a narrow single column layout</div>
        </div>
      </div>

      <div class="pane good">
        <div class="pane-header">
          <div class="pane-title">✅ webpage2pdf</div>
          <span class="tag good">1920px Desktop Engine</span>
        </div>
        <div class="screenshot-wrap">
          <img src="data:image/png;base64,${desktopB64}">
          <div class="overlay-success">✅ Preserves original desktop multi-column structure</div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
  await page.setContent(html2);
  await page.screenshot({ path: 'store-assets/screenshot-2-before-after-1280x800.png' });
  console.log('Saved screenshot-2-before-after-1280x800.png');

  // ─────────────────────────────────────────────────────────────
  // 3. Screenshot 3: Real Options & Settings UI (Localized to English)
  // ─────────────────────────────────────────────────────────────
  console.log('Generating Screenshot 3: Options UI...');
  const optionsPath = path.resolve('entrypoints/options/index.html');
  const optionsHtml = fs.readFileSync(optionsPath, 'utf-8');
  const enLocalesPath = path.resolve('public/_locales/en/messages.json');
  const enLocales = JSON.parse(fs.readFileSync(enLocalesPath, 'utf-8'));
  
  const html3 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { background: #0b0f19; margin: 0; padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 800px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .wrapper { width: 720px; background: #0f0f12; border: 1px solid #2a2a33; border-radius: 16px; padding: 28px 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); }
    </style>
  </head>
  <body>
    <div class="wrapper">
      ${optionsHtml.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')}
    </div>
    <script>
      const locales = ${JSON.stringify(enLocales)};
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (locales[key]) el.innerHTML = locales[key].message;
      });
    </script>
  </body>
  </html>
  `;
  await page.setContent(html3);
  await page.evaluate(() => {
    // Extra style fixes since CSS root vars might be missing if they were in a separate file
    document.body.style.setProperty('--bg', '#0f0f12');
    document.body.style.setProperty('--card', '#1a1a1f');
    document.body.style.setProperty('--fg', '#e8e8ec');
    document.body.style.setProperty('--muted', '#9aa0a6');
    document.body.style.setProperty('--accent', '#7c5cf0');
    document.body.style.setProperty('--border', '#2a2a33');
    document.body.style.setProperty('--input', '#23232a');
  });
  await page.screenshot({ path: 'store-assets/screenshot-3-options-1280x800.png' });
  console.log('Saved screenshot-3-options-1280x800.png');

  await browser.close();
  console.log('All store screenshots generated successfully with real site data!');
}

generateScreenshots().catch(console.error);
