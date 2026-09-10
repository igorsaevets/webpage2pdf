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
  // 4. Screenshot 4: Selectable Vector Text & PDF Viewer Proof
  // ─────────────────────────────────────────────────────────────
  console.log('Generating Screenshot 4: Selectable Vector Text Proof...');
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
      .search-input { background: transparent; border: none; outline: none; color: #f8fafc; font-size: 13px; width: 160px; }
      .search-match { font-size: 11px; color: #93c5fd; background: #1e3a8a; padding: 2px 6px; border-radius: 4px; font-weight: 600; }

      /* PDF Page Canvas View */
      .viewer-body { flex: 1; background: #0b0f19; display: flex; align-items: center; justify-content: center; padding: 32px; }
      .pdf-page { width: 680px; height: 680px; background: #ffffff; color: #0f172a; border-radius: 6px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5); padding: 48px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
      
      .page-header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
      .page-header h2 { font-size: 20px; font-weight: 800; color: #0f172a; }
      .page-header span { font-size: 12px; color: #64748b; }

      .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 13px; line-height: 1.6; color: #334155; }
      .column h3 { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
      
      /* Text Highlight */
      .highlight { background: #fef08a; color: #854d0e; padding: 1px 4px; border-radius: 2px; font-weight: 600; }
      .selection-blue { background: #bfdbfe; color: #1e3a8a; }

      .page-footer { border-top: 1px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-family: monospace; }

      /* Floating Callout */
      .proof-banner { position: absolute; right: 48px; bottom: 48px; background: rgba(15, 23, 42, 0.95); border: 1px solid #10b981; border-radius: 12px; padding: 16px 24px; max-width: 380px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.6); backdrop-filter: blur(8px); }
      .proof-banner h4 { font-size: 15px; font-weight: 700; color: #34d399; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
      .proof-banner p { font-size: 12px; color: #cbd5e1; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="pdf-toolbar">
      <div class="doc-info">
        <span class="pdf-badge">PDF</span>
        <span>quarterly-report-2026.pdf</span>
        <span style="color:#64748b; font-size:12px;">• Page 1 / 3 • 100% Vector</span>
      </div>
      <div class="search-box">
        <span>🔍</span>
        <input class="search-input" value="selectable text" readonly>
        <span class="search-match">3 of 3</span>
      </div>
    </div>

    <div class="viewer-body">
      <div class="pdf-page">
        <div>
          <div class="page-header">
            <h2>Annual Financial & Performance Audit</h2>
            <span>CONFIDENTIAL • 2026</span>
          </div>
          <div class="content-grid">
            <div class="column">
              <h3>1. Executive Summary</h3>
              <p>This document was exported using the 1920px desktop vector engine. Notice that all paragraph text contains a <span class="highlight">selectable text</span> layer, allowing full searchability and text extraction across all PDF viewers.</p>
              <br>
              <p>Unlike raster screenshot extensions that produce blurry 25MB images, this vector output preserves <span class="selection-blue">crisp typography, mathematical equations, and active hyperlinks</span> at any zoom level.</p>
            </div>
            <div class="column">
              <h3>2. Core Performance Metrics</h3>
              <p>Chrome's native print engine fails by collapsing multi-column structures. With native CDP emulation, both columns maintain their exact spatial ratio.</p>
              <br>
              <p>Search verification confirms that <span class="highlight">selectable text</span> is indexed verbatim with Unicode mappings intact.</p>
            </div>
          </div>
        </div>

        <div class="page-footer">
          <span>🔗 https://portal.internal/reports/q3-audit</span>
          <span>Generated by webpage2pdf • Clean Footer</span>
        </div>
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
