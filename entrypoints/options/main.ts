const DEFAULTS = { paper: 'a4', saveMode: 'ask', customDir: '', customPath: '' } as const;

const paperInputs = document.querySelectorAll<HTMLInputElement>('input[name="paper"]');
const saveModeInputs = document.querySelectorAll<HTMLInputElement>('input[name="saveMode"]');
const customDirInput = document.getElementById('customDir') as HTMLInputElement;
const customPathInput = document.getElementById('customPath') as HTMLInputElement;
const saveBtn = document.getElementById('save') as HTMLButtonElement;
const resetBtn = document.getElementById('reset') as HTMLButtonElement;
const statusEl = document.getElementById('status') as HTMLSpanElement;
const hostWarn = document.getElementById('hostWarn') as HTMLDivElement;
const downloadsField = document.getElementById('downloadsField') as HTMLDivElement;
const customField = document.getElementById('customField') as HTMLDivElement;

function updateVisibility() {
  const mode = (Array.from(saveModeInputs).find(i=>i.checked)?.value) ?? 'ask';
  downloadsField.style.opacity = mode === 'downloads' ? '1' : '0.45';
  customField.style.opacity = mode === 'custom' ? '1' : '0.45';
  customDirInput.disabled = mode !== 'downloads';
  customPathInput.disabled = mode !== 'custom';
  // host check: try ping native host indirectly? just show warn if custom selected — real check on save
  if (mode === 'custom') hostWarn.classList.add('show');
  else hostWarn.classList.remove('show');
}

async function load() {
  const v: any = await chrome.storage.sync.get(DEFAULTS);
  let sm = v.saveMode;
  if (sm === 'auto') sm = 'downloads'; // migrate
  const paper = v.paper === 'letter' ? 'letter' : 'a4';
  const saveMode = sm === 'custom' ? 'custom' : sm === 'downloads' ? 'downloads' : 'ask';
  for (const el of paperInputs) el.checked = el.value === paper;
  for (const el of saveModeInputs) el.checked = el.value === saveMode;
  customDirInput.value = typeof v.customDir === 'string' ? v.customDir : '';
  customPathInput.value = typeof v.customPath === 'string' ? v.customPath : '';
  updateVisibility();
}

function current() {
  const paper = (Array.from(paperInputs).find(i=>i.checked)?.value as any) ?? 'a4';
  const saveMode = (Array.from(saveModeInputs).find(i=>i.checked)?.value as any) ?? 'ask';
  return {
    paper: paper === 'letter' ? 'letter' : 'a4',
    saveMode: saveMode === 'custom' ? 'custom' : saveMode === 'downloads' ? 'downloads' : 'ask',
    customDir: customDirInput.value.trim(),
    customPath: customPathInput.value.trim(),
  } as const;
}

async function save() {
  const c = current();
  // migrate: ensure old key removed
  await chrome.storage.sync.set(c);
  statusEl.classList.add('show');
  statusEl.textContent = '✓ Сохранено';
  setTimeout(()=> statusEl.classList.remove('show'), 1800);
}

saveBtn.addEventListener('click', save);
resetBtn.addEventListener('click', async () => {
  await chrome.storage.sync.set({ ...DEFAULTS });
  await load();
  statusEl.classList.add('show');
  statusEl.textContent = '↺ Сброшено';
  setTimeout(()=> statusEl.classList.remove('show'), 1800);
});

for (const el of [...paperInputs, ...saveModeInputs]) el.addEventListener('change', ()=>{ updateVisibility(); save(); });
customDirInput.addEventListener('change', save);
customPathInput.addEventListener('change', save);

load();
