const btn = document.getElementById('btn') as HTMLButtonElement;
const logEl = document.getElementById('log') as HTMLDivElement;
const settingsLink = document.getElementById('settingsLink') as HTMLAnchorElement | null;
const hintEl = document.getElementById('hint') as HTMLDivElement | null;

settingsLink?.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});
document.getElementById('openDownloads')?.addEventListener('click', (e)=>{
  e.preventDefault();
  chrome.tabs.create({ url: 'chrome://downloads' });
});

// Localize HTML
document.querySelectorAll('[data-i18n]').forEach(el => {
  const key = el.getAttribute('data-i18n');
  if (key) {
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.innerHTML = msg; 
  }
});

btn.addEventListener('click', async () => {
  btn.disabled = true;
  btn.textContent = chrome.i18n.getMessage('statusGenerating') || 'Generating…';
  showLog(chrome.i18n.getMessage('logAttaching') || 'Attaching debugger, forcing desktop 1920px, rendering PDF…');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error(chrome.i18n.getMessage('logActiveTab') || 'No active tab');
    showLog(`Tab ${tab.id} — ${(tab.url||'').slice(0,70)} …`);
    const res: any = await chrome.runtime.sendMessage({ type: 'GENERATE_PDF', tabId: tab.id, url: tab.url });
    if (!res?.ok) throw new Error(res?.error ?? 'unknown error');
    const extra = res.warning === 'native_host_missing' ? '\n' + (chrome.i18n.getMessage('logSavedNative') || '⚠️ Native Host not installed — saved to Downloads.') : '';
    const via = res.via === 'native' ? ' (native host)' : '';
    showLog(`✓ Saved: ${res.filename}${via} (${res.paper ?? 'a4'}) — download #${res.downloadId}${extra}`);
    btn.textContent = chrome.i18n.getMessage('statusSaved') || 'Saved ✓';
    refreshHint();
  } catch (e:any) {
    const msg = String(e?.message ?? e);
    showLog('✗ Error: ' + msg + '\nInspect: chrome://extensions → Inspect service worker → Console');
    btn.textContent = chrome.i18n.getMessage('statusError') || 'Error — retry';
    console.error(e);
  } finally {
    btn.disabled = false;
    setTimeout(()=> btn.textContent = chrome.i18n.getMessage('btnSaveDesktop') || 'Save as PDF (desktop)', 4000);
  }
});

function showLog(s: string){ logEl.textContent = s; logEl.classList.add('show'); }
async function refreshHint(){
  const v:any = await chrome.storage.sync.get({ paper: 'a4', saveMode: 'ask', customDir: '', customPath: '' });
  let sm = v.saveMode; if (sm==='auto') sm='downloads';
  let desc = '';
  
  if (sm==='ask') desc = chrome.i18n.getMessage('hintAsk') || 'Ask where to save';
  else if (sm==='downloads') desc = (chrome.i18n.getMessage('hintAuto') || 'Auto: Downloads/$1').replace('$1', v.customDir ? `${v.customDir}/` : '');
  else if (sm==='custom') desc = (chrome.i18n.getMessage('hintCustom') || 'Custom: $1').replace('$1', v.customPath ? v.customPath : '— ⚙️');
  
  const paperStr = (chrome.i18n.getMessage('hintPaper') || 'Paper: $1').replace('$1', v.paper==='letter' ? 'Letter' : 'A4');
  
  if (hintEl) hintEl.textContent = `${paperStr} · ${desc}`;
}

refreshHint();
chrome.storage.onChanged.addListener(()=> refreshHint());
