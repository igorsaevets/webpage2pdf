import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function generateScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
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
      .page-content { padding: 32px 48px; display: grid; grid-template-columns: 240px 1fr; gap: 32px; height: 758px; background: #0f172a; }
      .sidebar { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
      .side-item { height: 14px; background: #334155; border-radius: 4px; margin-bottom: 14px; }
      .side-item.w70 { width: 70%; } .side-item.w50 { width: 50%; } .side-item.w85 { width: 85%; }
      
      .main { display: flex; flex-direction: column; gap: 24px; }
      .hero-card { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 12px; padding: 24px; }
      .title-line { height: 28px; width: 55%; background: #60a5fa; border-radius: 6px; margin-bottom: 12px; }
      .desc-line { height: 12px; width: 90%; background: #475569; border-radius: 4px; margin-bottom: 8px; }
      
      .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .col-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 18px; height: 160px; }
      
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
      .badge-banner { position: absolute; bottom: 32px; left: 48px; background: rgba(15, 23, 42, 0.9); border: 1px solid #3b82f6; backdrop-filter: blur(8px); border-radius: 12px; padding: 14px 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
      .badge-icon { width: 36px; height: 36px; background: #3b82f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .badge-text h3 { font-size: 15px; font-weight: 700; color: #ffffff; }
      .badge-text p { font-size: 12px; color: #93c5fd; margin-top: 2px; }
    </style>
  </head>
  <body>
    <div class="browser-bar">
      <div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
      <div class="url-bar">🔒 https://analytics.company.internal/quarterly-performance</div>
    </div>
    
    <div class="page-content">
      <div class="sidebar">
        <div class="side-item w70" style="background:#3b82f6; height:18px;"></div>
        <div class="side-item w50"></div>
        <div class="side-item w85"></div>
        <div class="side-item w70"></div>
        <div class="side-item w50"></div>
      </div>
      <div class="main">
        <div class="hero-card">
          <div class="title-line"></div>
          <div class="desc-line"></div>
          <div class="desc-line" style="width:75%;"></div>
        </div>
        <div class="grid3">
          <div class="col-card"><div class="side-item w50" style="background:#8b5cf6;"></div><div class="side-item w85"></div><div class="side-item w70"></div></div>
          <div class="col-card"><div class="side-item w50" style="background:#ec4899;"></div><div class="side-item w85"></div><div class="side-item w70"></div></div>
          <div class="col-card"><div class="side-item w50" style="background:#10b981;"></div><div class="side-item w85"></div><div class="side-item w70"></div></div>
        </div>
      </div>
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

      .compare-container { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; flex: 1; }
      
      .pane { background: #111827; border-radius: 16px; border: 1px solid #1f2937; padding: 24px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
      .pane.bad { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 10px 30px -10px rgba(239, 68, 68, 0.15); }
      .pane.good { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.2); }
      
      .pane-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #1f2937; }
      .pane-title { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
      .tag { font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 700; }
      .tag.bad { background: #450a0a; color: #f87171; border: 1px solid #991b1b; }
      .tag.good { background: #064e3b; color: #34d399; border: 1px solid #065f46; }

      /* Mockup Bad Viewport (740px mobile collapse) */
      .mock-page { background: #ffffff; color: #111827; border-radius: 8px; flex: 1; padding: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
      
      /* Bad collapsed elements */
      .collapsed-menu { height: 24px; background: #e5e7eb; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding: 0 8px; }
      .hamburger { width: 14px; height: 10px; border-top: 2px solid #6b7280; border-bottom: 2px solid #6b7280; position: relative; }
      .hamburger::after { content: ''; position: absolute; top: 2px; width: 14px; height: 2px; background: #6b7280; }
      .collapsed-col { background: #fee2e2; border: 1px dashed #ef4444; border-radius: 6px; padding: 12px; font-size: 11px; color: #991b1b; text-align: center; }
      .blank-image { height: 60px; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #9ca3af; font-style: italic; }

      /* Good Desktop Viewport (1920px) */
      .desktop-nav { height: 24px; background: #ede9fe; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; font-size: 10px; font-weight: 600; color: #6d28d9; }
      .desktop-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; flex: 1; }
      .desktop-col { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 10px; font-size: 10px; color: #065f46; display: flex; flex-direction: column; gap: 6px; }
      .rich-img { height: 48px; background: #c7d2fe; border-radius: 4px; }
      .footer-url { font-size: 9px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: auto; font-family: monospace; }
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
        <div class="mock-page">
          <div class="collapsed-menu"><div class="hamburger"></div></div>
          <div class="collapsed-col">⚠️ 3-Column Grid Collapsed into Single Vertical Column</div>
          <div class="blank-image">❌ Lazy Image Missing (Blank Rectangle)</div>
          <div class="collapsed-col" style="background:#fef2f2; border-color:#fca5a5;">⚠️ Text Stretches Over 25+ Redundant Pages</div>
        </div>
      </div>

      <div class="pane good">
        <div class="pane-header">
          <div class="pane-title">✅ webpage2pdf</div>
          <span class="tag good">1920px Desktop Vector Engine</span>
        </div>
        <div class="mock-page">
          <div class="desktop-nav">
            <span>LOGO</span>
            <span>Dashboard • Analytics • Reports • Settings</span>
          </div>
          <div class="desktop-grid">
            <div class="desktop-col"><div class="rich-img"></div><span>Column 1 (Data)</span></div>
            <div class="desktop-col"><div class="rich-img" style="background:#fbcfe8;"></div><span>Column 2 (Charts)</span></div>
            <div class="desktop-col"><div class="rich-img" style="background:#fed7aa;"></div><span>Column 3 (KPIs)</span></div>
          </div>
          <div class="footer-url">🔗 https://company.internal/report-2026-q3 (Page 1 of 2) • Real Selectable Vector Text</div>
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
  // 3. Screenshot 3: Real Options & Settings UI
  // ─────────────────────────────────────────────────────────────
  console.log('Generating Screenshot 3: Options UI...');
  const optionsPath = path.resolve('entrypoints/options/index.html');
  const optionsHtml = fs.readFileSync(optionsPath, 'utf-8');
  
  // Wrap options HTML in a container styled for 1280x800
  const html3 = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { background: #0b0f19; margin: 0; padding: 40px; display: flex; align-items: center; justify-content: center; min-height: 800px; }
      .wrapper { width: 720px; background: #0f0f12; border: 1px solid #2a2a33; border-radius: 16px; padding: 28px 36px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); }
    </style>
  </head>
  <body>
    <div class="wrapper">
      ${optionsHtml.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')}
    </div>
  </body>
  </html>
  `;
  await page.setContent(html3);
  await page.screenshot({ path: 'store-assets/screenshot-3-options-1280x800.png' });
  console.log('Saved screenshot-3-options-1280x800.png');

  await browser.close();
  console.log('All screenshots generated successfully!');
}

generateScreenshots().catch(console.error);
