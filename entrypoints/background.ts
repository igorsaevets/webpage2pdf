export default defineBackground(() => {
  console.log('[webpage2pdf] background loaded — v5 (contextMenus)');

  const CONTEXT_MENU_ID = 'webpage2pdf-save-page';
  const busyTabs = new Set<number>();

  function setBadge(text: string, color: string, autoClearMs = 0) {
    try {
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color });
      if (autoClearMs > 0) {
        setTimeout(() => {
          chrome.action.setBadgeText({ text: '' });
        }, autoClearMs);
      }
    } catch {}
  }

  async function showToast(tabId: number, message: string, type: 'info' | 'success' | 'error' = 'info') {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: (msg: string, t: 'info' | 'success' | 'error') => {
          const id = 'webpage2pdf-hud-toast';
          let el = document.getElementById(id);
          if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.style.cssText = `
              position: fixed;
              bottom: 24px;
              right: 24px;
              z-index: 2147483647;
              padding: 12px 18px;
              border-radius: 10px;
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 13px;
              font-weight: 600;
              box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1);
              transition: opacity 0.25s ease, transform 0.25s ease;
              pointer-events: none;
              display: flex;
              align-items: center;
              gap: 10px;
              line-height: 1.4;
            `;
            document.documentElement.appendChild(el);
          }
          if (t === 'error') {
            el.style.background = '#7f1d1d';
            el.style.color = '#fee2e2';
            el.style.border = '1px solid #ef4444';
          } else if (t === 'success') {
            el.style.background = '#064e3b';
            el.style.color = '#d1fae5';
            el.style.border = '1px solid #10b981';
          } else {
            el.style.background = '#1e1b4b';
            el.style.color = '#e0e7ff';
            el.style.border = '1px solid #6366f1';
          }
          el.textContent = msg;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';

          if (t !== 'info') {
            setTimeout(() => {
              if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(8px) scale(0.96)';
                setTimeout(() => el?.remove(), 300);
              }
            }, 3500);
          }
        },
        args: [message, type],
      });
    } catch {
      // Ignored on restricted internal pages like chrome://
    }
  }

  function setupContextMenu() {
    try {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create(
          {
            id: CONTEXT_MENU_ID,
            title: chrome.i18n.getMessage('contextMenuSave') || 'Save page as PDF (desktop)',
            contexts: ['page', 'selection', 'frame'],
          },
          () => {
            if (chrome.runtime.lastError) {
              console.warn('[webpage2pdf] contextMenu error:', chrome.runtime.lastError.message);
            }
          }
        );
      });
    } catch (e) {
      console.warn('[webpage2pdf] setupContextMenu exception:', e);
    }
  }

  // Register on install/update and top-level startup
  chrome.runtime.onInstalled.addListener(() => {
    setupContextMenu();
  });
  setupContextMenu();

  async function handleContextMenuSave(tabId: number, url: string) {
    if (busyTabs.has(tabId)) {
      await showToast(tabId, '⚠️ PDF generation already in progress…', 'info');
      return;
    }
    busyTabs.add(tabId);
    setBadge('...', '#7c5cf0');
    const genMsg = chrome.i18n.getMessage('toastGenerating') || 'Generating desktop PDF (1920px)…';
    await showToast(tabId, `📄 webpage2pdf: ${genMsg}`, 'info');

    try {
      const res = await generatePdf(tabId, url);
      setBadge('✓', '#10b981', 3500);
      const savedMsg = chrome.i18n.getMessage('toastSaved') || 'PDF saved successfully ✓';
      const fileLabel = res?.filename ? ` (${res.filename})` : '';
      await showToast(tabId, `✓ ${savedMsg}${fileLabel}`, 'success');
    } catch (e: any) {
      setBadge('ERR', '#ef4444', 4000);
      const errText = String(e?.message ?? e);
      await showToast(tabId, `✗ Error: ${errText}`, 'error');
    } finally {
      busyTabs.delete(tabId);
    }
  }

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID && tab?.id) {
      await handleContextMenuSave(tab.id, tab.url ?? '');
    }
  });

  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try { await handleContextMenuSave(tab.id, tab.url ?? ''); } catch (e) { console.error('[webpage2pdf] action click failed', e); }
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'GENERATE_PDF') {
      const tabId = msg.tabId as number | undefined;
      const url = msg.url as string | undefined;
      if (tabId) {
        generatePdf(tabId, url ?? '')
          .then((res) => sendResponse({ ok: true, ...res }))
          .catch((e) => sendResponse({ ok: false, error: String((e as any)?.message ?? e) }));
        return true;
      }
    }
    if (msg?.type === 'GET_SETTINGS') {
      getSettings().then(s => sendResponse(s));
      return true;
    }
  });

  // ── Types & Settings ──────────────────────────────────────────────
  type Paper = 'a4' | 'letter';
  type SaveMode = 'ask' | 'downloads' | 'custom';
  interface Settings { paper: Paper; saveMode: SaveMode; customDir: string; customPath: string; }
  const DEFAULTS: Settings = { paper: 'a4', saveMode: 'ask', customDir: '', customPath: '' };

  async function getSettings(): Promise<Settings> {
    try {
      const raw: any = await chrome.storage.sync.get({ paper: 'a4', saveMode: 'ask', customDir: '', customPath: '', saveModeOld: undefined });
      let sm: string = raw.saveMode ?? (raw.saveModeOld === 'auto' ? 'downloads' : 'ask');
      if (sm === 'auto') sm = 'downloads';
      const paper = raw.paper === 'letter' ? 'letter' : 'a4';
      const saveMode: SaveMode = sm === 'custom' ? 'custom' : sm === 'downloads' ? 'downloads' : 'ask';
      const customDir = typeof raw.customDir === 'string' ? raw.customDir.trim() : '';
      const customPath = typeof raw.customPath === 'string' ? raw.customPath.trim() : '';
      return { paper, saveMode, customDir, customPath };
    } catch { return DEFAULTS; }
  }

  // ── Filename helpers ──────────────────────────────────────────────
  function sanitizeCustomDir(dir: string): string {
    let s = dir.replace(/\\/g, '/').trim();
    s = s.replace(/^[a-zA-Z]:\//, '');
    s = s.replace(/^\/+/, '');
    const parts = s.split('/').map(p => p.trim()).filter(p => p && p !== '.' && p !== '..');
    const safe = parts.map(p => p.replace(/[<>:"|?*\x00-\x1F]/g, '_').replace(/\.+$/g, '').slice(0, 80)).filter(Boolean);
    return safe.join('/');
  }

  function sanitizeFilenameSegment(s: string): string {
    return s.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, ' ').trim().slice(0, 120).replace(/\.+$/g, '') || 'page';
  }

  function urlToSafeBase(url: string): string {
    try {
      const u = new URL(url);
      let host = u.hostname || 'page';
      let path = u.pathname || '';
      path = path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
      let base = host;
      if (path) base += '-' + path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
      base = base.toLowerCase();
      base = sanitizeFilenameSegment(base);
      if (base.length > 80) base = base.slice(0, 80).replace(/-+$/, '');
      return base || 'page';
    } catch {
      return sanitizeFilenameSegment(url.replace(/^https?:\/\//, '').slice(0, 80) || 'page');
    }
  }

  function buildFilename(sourceUrl: string, settings: Settings): string {
    const date = new Date().toISOString().slice(0, 10);
    const base = urlToSafeBase(sourceUrl);
    const file = `${base}-${date}.pdf`;
    if (settings.saveMode === 'downloads' && settings.customDir) {
      const dir = sanitizeCustomDir(settings.customDir);
      return dir ? `${dir}/${file}` : file;
    }
    return file;
  }

  function isAbsolutePath(p: string): boolean {
    return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('\\\\') || p.startsWith('/');
  }

  // ── Download helpers ──────────────────────────────────────────────
  async function downloadViaDataUrlOrBlob(base64: string, filename: string, saveAs: boolean): Promise<number> {
    const dataUrl = `data:application/pdf;base64,${base64}`;
    try {
      const id = await downloadsDownload({ url: dataUrl, filename, saveAs });
      return id;
    } catch (e) {
      console.warn('[webpage2pdf] dataUrl download failed, trying blob fallback', e);
    }
    try {
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      try {
        const id = await downloadsDownload({ url: blobUrl, filename, saveAs });
        return id;
      } finally {
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      }
    } catch (e) { throw e; }
  }

  function downloadsDownload(opts: chrome.downloads.DownloadOptions): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        chrome.downloads.download(opts, (downloadId) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else if (downloadId === undefined) reject(new Error('downloads.download returned undefined'));
          else resolve(downloadId);
        });
      } catch (e) { reject(e); }
    });
  }

  async function trySaveViaNativeHost(absoluteDir: string, filenameOnly: string, base64: string): Promise<boolean> {
    const hostName = 'com.webpage2pdf.host';
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendNativeMessage(hostName, { action: 'save', dir: absoluteDir, filename: filenameOnly, data: base64 }, (response: any) => {
          const err = chrome.runtime.lastError;
          if (err) { console.warn('[webpage2pdf] native host not available:', err.message); resolve(false); return; }
          if (response && response.ok) { console.log('[webpage2pdf] saved via native host:', response.path); resolve(true); }
          else { console.warn('[webpage2pdf] native host error:', response); resolve(false); }
        });
      } catch (e) { console.warn('[webpage2pdf] sendNativeMessage threw', e); resolve(false); }
    });
  }

  // ── CDP helpers ───────────────────────────────────────────────────
  async function cdpEval(d: chrome.debugger.Debuggee, expr: string, awaitPromise = false): Promise<any> {
    try {
      return await chrome.debugger.sendCommand(d, 'Runtime.evaluate', { expression: expr, awaitPromise });
    } catch (e) {
      console.warn('[webpage2pdf] cdpEval failed', e);
    }
  }

  async function cdpTry(d: chrome.debugger.Debuggee, method: string, params?: Record<string, unknown>): Promise<void> {
    try { await chrome.debugger.sendCommand(d, method, params); } catch (e) { console.warn('[webpage2pdf] ' + method, e); }
  }

  // ── v4: Injected scripts (plain JS, no TS syntax) ────────────────

  const SCRIPT_FORCE_LAZY = `(function(){
    try {
      document.querySelectorAll('img[loading="lazy"]').forEach(function(i){i.loading='eager';i.decoding='sync';});
      document.querySelectorAll('[loading="lazy"]').forEach(function(el){try{el.loading='eager';}catch(e){}});
      document.querySelectorAll('img[data-src], img[data-lazy-src], img[data-original], img[data-lazy], img[data-delayed-url]').forEach(function(img){
        var ds=(img.getAttribute('data-src')||img.getAttribute('data-lazy-src')||img.getAttribute('data-original')||img.getAttribute('data-lazy')||img.getAttribute('data-delayed-url')||'').trim();
        if(ds && !img.src) img.src=ds;
        if(ds && img.src!==ds) { try{img.src=ds;}catch(e){} }
        var dss=img.getAttribute('data-srcset')||img.getAttribute('data-lazy-srcset');
        if(dss) img.srcset=dss;
      });
      document.querySelectorAll('source[data-srcset]').forEach(function(s){
        var ds=s.getAttribute('data-srcset'); if(ds) s.setAttribute('srcset', ds);
      });
      document.querySelectorAll('video[data-poster]').forEach(function(v){
        var p=v.getAttribute('data-poster'); if(p) v.poster=p;
      });
      document.querySelectorAll('noscript').forEach(function(ns){
        var temp=document.createElement('div'); temp.innerHTML=ns.textContent||'';
        var imgs=temp.querySelectorAll('img');
        imgs.forEach(function(img){
          var existing=ns.parentElement?ns.parentElement.querySelector('img[data-src="'+img.src+'"]'):null;
          if(!existing&&img.src&&ns.parentElement) {
            var clone=img.cloneNode(true);
            clone.setAttribute('data-w2p-noscript','1');
            ns.parentElement.insertBefore(clone, ns);
          }
        });
      });
      document.querySelectorAll('img').forEach(function(img){
        try{ if(!img.complete || img.naturalWidth===0){ var s=img.src; img.src=''; img.src=s; } }catch(e){}
      });
    } catch(e){}
    return true;
  })()`;

  const SCRIPT_PRELOAD_BG = `(function(){
    try {
      var loaded={}; var count=0;
      var all=document.querySelectorAll('*');
      var max=Math.min(all.length, 5000);
      for(var i=0; i<max; i++){
        var style;
        try{ style=getComputedStyle(all[i]); }catch(e){ continue; }
        var bg=style.backgroundImage;
        if(!bg || bg==='none') continue;
        var matches=bg.match(/url\\(['"]?([^'"\\)\\s]+)['"]?\\)/g);
        if(!matches) continue;
        for(var j=0; j<matches.length; j++){
          var src=matches[j].replace(/url\\(['"]?/,'').replace(/['"]?\\)/,'');
          if(src && !loaded[src] && !src.startsWith('data:') && !src.startsWith('blob:')){
            loaded[src]=1; count++;
            var img=new Image(); img.src=src;
          }
        }
      }
      console.log('[w2p] preloaded '+count+' CSS background images');
    } catch(e){}
    return true;
  })()`;

  const SCRIPT_EXPAND_HIDDEN = `(function(){
    try {
      var markers=[];
      // Swiper slides
      document.querySelectorAll('.swiper-slide').forEach(function(s){
        if(getComputedStyle(s).display==='none' || getComputedStyle(s).visibility==='hidden'){
          s.style.setProperty('visibility','visible','important');
          s.style.setProperty('display','block','important');
          s.setAttribute('data-w2p-unhidden','1');
        }
      });
      // Slick slides
      document.querySelectorAll('.slick-slide[aria-hidden="true"]').forEach(function(s){
        s.style.setProperty('visibility','visible','important');
        s.setAttribute('data-w2p-unhidden','1');
      });
      // Bootstrap carousel items
      document.querySelectorAll('.carousel-item:not(.active)').forEach(function(s){
        s.style.setProperty('display','block','important');
        s.style.setProperty('position','absolute','important');
        s.style.setProperty('visibility','visible','important');
        s.style.setProperty('opacity','0','important');
        s.setAttribute('data-w2p-unhidden','1');
      });
      // Owl carousel
      document.querySelectorAll('.owl-item').forEach(function(s){
        if(getComputedStyle(s).display==='none'){
          s.style.setProperty('display','block','important');
          s.setAttribute('data-w2p-unhidden','1');
        }
      });
      // Flickity
      document.querySelectorAll('.flickity-slider .slide, .flickity-cell').forEach(function(s){
        if(getComputedStyle(s).display==='none'){
          s.style.setProperty('display','block','important');
          s.setAttribute('data-w2p-unhidden','1');
        }
      });
      // Splide
      document.querySelectorAll('.splide__slide').forEach(function(s){
        if(getComputedStyle(s).visibility==='hidden'){
          s.style.setProperty('visibility','visible','important');
          s.setAttribute('data-w2p-unhidden','1');
        }
      });
      // Generic tab panels
      document.querySelectorAll('[role="tabpanel"][hidden], [role="tabpanel"][aria-hidden="true"]').forEach(function(s){
        s.removeAttribute('hidden');
        s.setAttribute('aria-hidden','false');
        s.style.setProperty('display','block','important');
        s.setAttribute('data-w2p-unhidden','1');
      });
      // details/summary — expand all
      document.querySelectorAll('details:not([open])').forEach(function(d){
        d.setAttribute('open','');
        d.setAttribute('data-w2p-opened','1');
      });
      // Force-load images in now-visible elements
      document.querySelectorAll('[data-w2p-unhidden] img, [data-w2p-opened] img').forEach(function(img){
        var ds=img.getAttribute('data-src')||img.getAttribute('data-lazy-src')||img.getAttribute('data-lazy')||'';
        if(ds && (!img.src || img.src==='about:blank')) img.src=ds;
        if(!img.complete){ var s=img.src; img.src=''; img.src=s; }
      });
      var unhidden=document.querySelectorAll('[data-w2p-unhidden]').length;
      var opened=document.querySelectorAll('[data-w2p-opened]').length;
      console.log('[w2p] expanded: '+unhidden+' slider items, '+opened+' details');
    } catch(e){}
    return true;
  })()`;

  const SCRIPT_RESTORE_SLIDERS = `(function(){
    try {
      document.querySelectorAll('[data-w2p-unhidden]').forEach(function(el){
        el.style.removeProperty('visibility');
        el.style.removeProperty('display');
        el.style.removeProperty('position');
        el.style.removeProperty('opacity');
        el.removeAttribute('data-w2p-unhidden');
      });
    } catch(e){}
    return true;
  })()`;

  const SCRIPT_RESTORE_DETAILS = `(function(){
    try {
      document.querySelectorAll('[data-w2p-opened]').forEach(function(d){
        d.removeAttribute('open');
        d.removeAttribute('data-w2p-opened');
      });
    } catch(e){}
    return true;
  })()`;

  const SCRIPT_SCROLL_STAGED = `new Promise(function(resolve){
    var h=Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    var steps=10; var i=0;
    function step(){
      if(i>steps){ window.scrollTo(0,0); resolve(true); return; }
      window.scrollTo(0, Math.round(h*i/steps));
      window.dispatchEvent(new Event('scroll'));
      i++;
      setTimeout(step, 150);
    }
    step();
  })`;

  const SCRIPT_SCROLL_BOUNCE = `new Promise(function(resolve){
    var h=Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    window.scrollTo(0,h);
    setTimeout(function(){ window.scrollTo(0,0); resolve(true); }, 400);
  })`;

  const SCRIPT_POLL_IMAGES = `new Promise(function(resolve){
    var deadline=Date.now()+8000;
    function check(){
      var imgs=Array.from(document.images);
      var pending=imgs.filter(function(i){return !i.complete || i.naturalWidth===0;});
      if(pending.length===0 || Date.now()>deadline) resolve(pending.length);
      else setTimeout(check, 200);
    }
    check();
  })`;

  const SCRIPT_UNSTICK_HEADERS = `(function(){
    try {
      var all = document.querySelectorAll('*');
      var max = Math.min(all.length, 10000);
      var count = 0;
      for (var i = 0; i < max; i++) {
        var el = all[i];
        var style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'sticky') {
          el.setAttribute('data-w2p-position', style.position);
          el.style.setProperty('position', style.position === 'fixed' ? 'absolute' : 'static', 'important');
          count++;
        }
      }
      console.log('[w2p] unstuck ' + count + ' elements');
    } catch(e){}
    return true;
  })()`;

  const SCRIPT_RESTORE_HEADERS = `(function(){
    try {
      document.querySelectorAll('[data-w2p-position]').forEach(function(el){
        el.style.removeProperty('position');
        el.removeAttribute('data-w2p-position');
      });
    } catch(e){}
    return true;
  })()`;

  // ── v4: PDF verification ─────────────────────────────────────────
  interface PdfVerification {
    ok: boolean;
    sizeBytes: number;
    pageCount: number;
    reason?: string;
  }

  function verifyPdfData(base64: string): PdfVerification {
    if (!base64 || base64.length < 100) {
      return { ok: false, sizeBytes: 0, pageCount: 0, reason: 'Empty or trivially small PDF data' };
    }

    const sizeBytes = Math.ceil(base64.length * 3 / 4);

    try {
      const headerRaw = atob(base64.slice(0, 24));
      if (!headerRaw.startsWith('%PDF-')) {
        return { ok: false, sizeBytes, pageCount: 0, reason: 'Invalid PDF header — not %PDF-' };
      }
    } catch {
      return { ok: false, sizeBytes, pageCount: 0, reason: 'Failed to decode base64 header' };
    }

    if (sizeBytes < 3000) {
      return { ok: false, sizeBytes, pageCount: 0, reason: `Suspiciously small (${sizeBytes} bytes) — likely blank` };
    }

    let pageCount = -1;
    try {
      const tailLen = Math.min(base64.length, 2000);
      const tailStart = base64.length - tailLen;
      const alignedStart = tailStart - (tailStart % 4);
      const tailRaw = atob(base64.slice(Math.max(0, alignedStart)));
      const countMatch = tailRaw.match(/\/Count\s+(\d+)/);
      if (countMatch && countMatch[1]) pageCount = parseInt(countMatch[1], 10);
    } catch {}

    return { ok: true, sizeBytes, pageCount };
  }

  // ── v4: Translation detection (logging only) ─────────────────────
  async function detectTranslated(tabId: number): Promise<boolean> {
    try {
      const res: any = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const html = document.documentElement;
          if (html.classList.contains('translated-ltr') || html.classList.contains('translated-rtl')) return true;
          if (html.getAttribute('translated-ltr') !== null || html.getAttribute('translated-rtl') !== null) return true;
          if (document.getElementById('google_translate_element') || document.getElementById('goog-gt-tt') || document.querySelector('.goog-te-banner-frame')) return true;
          if (document.querySelector('link[href*="translate.googleapis.com"]')) return true;
          const deeplSel = ['[id*="deepl"]', '[class*="deepl"]', '[class*="dl-"]', 'iframe[src*="deepl.com"]', 'iframe[src*="deepl"]', '[data-deepl]', '[data-testid*="deepl"]'];
          for (const sel of deeplSel) { try { if (document.querySelector(sel)) return true; } catch {} }
          const w: any = window as any;
          if (w.__deepl || w.deepl || w.DeepL) return true;
          for (const attr of Array.from(html.attributes)) {
            if (attr.name.toLowerCase().includes('deepl') || attr.value.toLowerCase().includes('deepl')) return true;
          }
          return false;
        },
      });
      return !!res?.[0]?.result;
    } catch { return false; }
  }

  // ── Core: generatePdf (v4 — live tab, preload, verify) ───────────
  async function generatePdf(sourceTabId: number, sourceUrl: string) {
    const settings = await getSettings();
    const isTranslated = await detectTranslated(sourceTabId);
    if (isTranslated) console.log('[webpage2pdf] translated page — live tab preserves translation');

    // v4: always live tab — no clone. Preserves translation, POST state, SPA state, auth tokens.
    const targetTabId = sourceTabId;
    const debuggee = { tabId: targetTabId };
    let attached = false;

    try {
      await chrome.debugger.attach(debuggee, '1.3');
      attached = true;

      // Save scroll position — restore after preloading
      await cdpEval(debuggee, 'window.__w2pScrollY = window.scrollY');

      // Desktop viewport for srcset/picture/IntersectionObserver
      const DESKTOP_W = 1920, DESKTOP_H = 1080;
      await cdpTry(debuggee, 'Emulation.setEmulatedMedia', { media: 'screen' });
      await cdpTry(debuggee, 'Emulation.setDeviceMetricsOverride', { width: DESKTOP_W, height: DESKTOP_H, deviceScaleFactor: 1, mobile: false });
      await sleep(300);

      // ① Force lazy images to eager + noscript fallbacks
      await cdpEval(debuggee, SCRIPT_FORCE_LAZY);

      // ② Preload CSS background-image URLs into browser cache
      await cdpEval(debuggee, SCRIPT_PRELOAD_BG);

      // ③ Temporarily expand hidden slider/carousel/tab/details content
      await cdpEval(debuggee, SCRIPT_EXPAND_HIDDEN);
      await sleep(200);

      // ④ Staged scroll — triggers IntersectionObserver on all sections
      await cdpEval(debuggee, SCRIPT_SCROLL_STAGED, true);
      await sleep(600);

      // ⑤ Bounce scroll (bottom→top) — catches observers that fire on scroll-up
      await cdpEval(debuggee, SCRIPT_SCROLL_BOUNCE, true);
      await sleep(400);

      // ⑥ Restore sliders to original state (only active slide visible for print)
      await cdpEval(debuggee, SCRIPT_RESTORE_SLIDERS);
      // Keep details/summary expanded — more content in PDF

      // ⑦ Wait for fonts
      try {
        await cdpEval(debuggee, 'document.fonts ? document.fonts.ready.then(function(){return true}) : Promise.resolve(true)', true);
      } catch {}

      // ⑧ Poll image completion (8s deadline)
      const pendingResult = await cdpEval(debuggee, SCRIPT_POLL_IMAGES, true);
      const pendingCount = pendingResult?.result?.value ?? '?';
      if (pendingCount !== 0) console.log('[webpage2pdf] images still pending after deadline:', pendingCount);
      await sleep(200);

      // ⑨ Restore scroll position before print
      await cdpEval(debuggee, 'window.scrollTo(0, window.__w2pScrollY || 0); delete window.__w2pScrollY');

      // ⑩ Unstick headers so they don't repeat on every PDF page
      await cdpEval(debuggee, SCRIPT_UNSTICK_HEADERS);
      await sleep(100);

      // ── Print PDF ──
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const footerHtml = `<div style="width:100%; padding:0 0.4in; box-sizing:border-box; font-family:-apple-system,Arial,sans-serif;"><div style="font-size:7.5px; color:#6b7280; line-height:1.35; text-align:center; word-break:break-all; overflow-wrap:anywhere; white-space:normal; border-top:1px solid #e5e7eb; padding-top:6px;">${esc(sourceUrl || 'about:blank')}</div></div>`;

      const isLetter = settings.paper === 'letter';
      const paperWidth = isLetter ? 8.5 : 8.27;
      const paperHeight = isLetter ? 11 : 11.69;
      const scale = (paperWidth - 0.8) * 96 / DESKTOP_W;

      const pdf: any = await chrome.debugger.sendCommand(debuggee, 'Page.printToPDF', {
        paperWidth, paperHeight,
        marginTop: 0.4, marginBottom: 0.6, marginLeft: 0.4, marginRight: 0.4,
        printBackground: true, preferCSSPageSize: false, scale,
        displayHeaderFooter: true, headerTemplate: '<div></div>', footerTemplate: footerHtml,
        generateTaggedPDF: true,
      });

      const base64: string = pdf.data;

      // ── v4: Verify PDF ──
      const verification = verifyPdfData(base64);
      console.log('[webpage2pdf] verification:', JSON.stringify(verification));

      if (!verification.ok) {
        throw new Error(`PDF verification failed: ${verification.reason}`);
      }

      // ── Restore DOM state after print ──
      await cdpEval(debuggee, SCRIPT_RESTORE_DETAILS);
      await cdpEval(debuggee, SCRIPT_RESTORE_HEADERS);

      // ── Save ──
      const filenameOnly = buildFilename(sourceUrl, { ...settings, customDir: settings.saveMode === 'downloads' ? settings.customDir : '' });

      if (settings.saveMode === 'custom' && settings.customPath) {
        const abs = settings.customPath.trim();
        if (isAbsolutePath(abs)) {
          const ok = await trySaveViaNativeHost(abs, filenameOnly, base64);
          if (ok) {
            return { filename: abs.replace(/[\\/]+$/, '') + '\\' + filenameOnly, downloadId: -1, paper: settings.paper, via: 'native', verification };
          } else {
            console.warn('[webpage2pdf] native host unavailable, falling back to Downloads');
            const fallback = await downloadViaDataUrlOrBlob(base64, filenameOnly, false);
            return { filename: filenameOnly + ' (fallback: native host not installed)', downloadId: fallback, paper: settings.paper, warning: 'native_host_missing', verification };
          }
        } else {
          throw new Error('Custom path must be absolute (e.g. D:\\MyPdfs)');
        }
      }

      const saveAs = settings.saveMode === 'ask';
      const fname = buildFilename(sourceUrl, settings);
      console.log('[webpage2pdf] downloading', { paper: settings.paper, paperWidth, paperHeight, scale, filename: fname, saveAs, bytes: verification.sizeBytes, pages: verification.pageCount, saveMode: settings.saveMode });
      const downloadId = await downloadViaDataUrlOrBlob(base64, fname, saveAs);
      console.log('[webpage2pdf] download started id', downloadId, fname);
      return { filename: fname, downloadId, paper: settings.paper, saveMode: settings.saveMode, verification };

    } catch (e) {
      // Attempt to restore page state even on error
      try { await cdpEval(debuggee, SCRIPT_RESTORE_SLIDERS); } catch {}
      try { await cdpEval(debuggee, SCRIPT_RESTORE_DETAILS); } catch {}
      try { await cdpEval(debuggee, SCRIPT_RESTORE_HEADERS); } catch {}
      try { await cdpEval(debuggee, 'window.scrollTo(0, window.__w2pScrollY || 0); delete window.__w2pScrollY'); } catch {}
      console.error('[webpage2pdf] generatePdf error', e);
      throw e;
    } finally {
      if (attached) {
        try { await chrome.debugger.sendCommand(debuggee, 'Emulation.clearDeviceMetricsOverride'); } catch {}
        try { await chrome.debugger.sendCommand(debuggee, 'Emulation.setEmulatedMedia', { media: '' }); } catch {}
        try { await chrome.debugger.detach(debuggee); } catch {}
      }
    }
  }

  function sleep(ms: number) { return new Promise<void>(function(r){ setTimeout(r, ms); }); }
});
