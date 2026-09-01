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

btn.addEventListener('click', async () => {
  btn.disabled = true;
  btn.textContent = 'Generating…';
  showLog('Attaching debugger, forcing desktop 1920px, rendering PDF…');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No active tab');
    showLog(`Tab ${tab.id} — ${(tab.url||'').slice(0,70)} …`);
    const res: any = await chrome.runtime.sendMessage({ type: 'GENERATE_PDF', tabId: tab.id, url: tab.url });
    if (!res?.ok) throw new Error(res?.error ?? 'unknown error');
    const extra = res.warning === 'native_host_missing' ? '\n⚠️ Native Host не установлен — сохранено в Загрузки. Поставь native-host/install_host.bat' : '';
    const via = res.via === 'native' ? ' (native host)' : '';
    showLog(`✓ Saved: ${res.filename}${via} (${res.paper ?? 'a4'}) — download #${res.downloadId}${extra}`);
    btn.textContent = 'Saved ✓';
    refreshHint();
  } catch (e:any) {
    const msg = String(e?.message ?? e);
    showLog('✗ Error: ' + msg + '\nInspect: chrome://extensions → Inspect service worker → Console');
    btn.textContent = 'Error — retry';
    console.error(e);
  } finally {
    btn.disabled = false;
    setTimeout(()=> btn.textContent='Save as PDF (desktop)', 4000);
  }
});

function showLog(s: string){ logEl.textContent = s; logEl.classList.add('show'); }
async function refreshHint(){
  const v:any = await chrome.storage.sync.get({ paper: 'a4', saveMode: 'ask', customDir: '', customPath: '' });
  let sm = v.saveMode; if (sm==='auto') sm='downloads';
  let desc = '';
  if (sm==='ask') desc = 'Спрашивать куда сохранять';
  else if (sm==='downloads') desc = v.customDir ? `Авто: Downloads/${v.customDir}/` : 'Авто: Downloads/';
  else if (sm==='custom') desc = v.customPath ? `Кастом: ${v.customPath}` : 'Кастом: — укажи путь в ⚙️';
  if (hintEl) hintEl.textContent = `Бумага: ${v.paper==='letter'?'Letter (USA)':'A4'} · ${desc} — ⚙️ Настройки`;
}
refreshHint();
chrome.storage.onChanged.addListener(()=> refreshHint());
