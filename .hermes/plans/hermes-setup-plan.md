# webpage2pdf — План 5 итераций (диск канон, переживает compact)
# Создан 2026-09-01 И0 (аудит Claude Code + WEB to MD), перенесён в D:\Hermes\webpage2pdf

## Корень проекта этого чата
**D:\Hermes\webpage2pdf** — весь код, доки, ответы, план. Корень D:\Hermes — только глобальные AGENTS.md/.hermes.md + archive/.

## Статус
- И0 DONE (аудит) — D:\Hermes\webpage2pdf\answers\iteration-00-audit-2026-09-01\answer-2026-09-01.md
- Следующая: И1 — скаффолд D:\Hermes\webpage2pdf (wxt, git, hooks, .gitignore)
- Триггер после compact: "Продолжи итерацию 1: скаффолд webpage2pdf"

## Итерации (строго одна за промт)
1. **И1 — Скаффолд** — D:\Hermes\webpage2pdf\ (wxt init, package.json, AGENTS.md уже есть, .gitignore, README, LICENSE, scripts/check-memory.sh портированный, publish_audit). `git init` + `hermes doctor`.
2. **И2 — Ядро PDF (текстовый слой)** — chrome.debugger Page.printToPDF (background SW, extractor on-demand, progress via runtime.sendMessage, storage.session cache). Альтернативы исследованы (window.print, jsPDF, canvas — отброшены).
3. **И3 — UI/UX + e2e** — popup (Extract/Download), badge, offscreen если нужен, иконки sharp, PRIVACY.md, .e2e/e2e-pdf.mjs (puppeteer-core, wxt e2e mode), без <all_urls>.
4. **И4 — GitHub** — gh repo create igorsaevets/webpage2pdf, workflows (build.yml/ci.yml), git push, tag v0.1.0, gh release, verify commit-pinned raw URL + клон в %TEMP%.
5. **И5 — Chrome Web Store** — листинг (1280x800 скрины, description, privacy), zip wxt zip, загрузка dashboard/api, verify update2/crx?prodversion=140&x=id%3D...&uc + listing 200.

## Ключевые находки для И1
- Claude Code: MEM 200/25KB silent drop, .claude/state/NOW.md ≤150, .claude/rules/00-hard-rules.md (inherits subagent), hooks session-anchor + mirror_answers, answers/YYYY-MM-DD/.
- WEB to MD: auto-memory + .memory/ (00_TRUTH 185, STATE 400, HUMAN_TASKS 200, hook-check-ht.sh proven 2026-07-30). Load: CLAUDE.md→MEM→00_TRUTH→STATE→HUMAN_TASKS.
- Hermes: AGENTS.md cwd-only 20k head+tail, .hermes.md walk-up до git root, memories в C:\Users\igors\AppData\Local\hermes\memories\MEMORY.md, config via hermes config set.
- Браузер: computer_use (cua-driver background) + desktop_preview/drive_preview = твой Chrome с куками; не Playwright MCP (занят Claude Code); рандом 0–11s между кликами.
- PDF textual: только debugger Page.printToPDF (warning жёлтый бар); window.print — диалог; canvas — картинка (запрещено).

## Что отправить после compact
Продолжи итерацию 1: скаффолд webpage2pdf
Контекст: план в D:\Hermes\webpage2pdf\.hermes\plans\hermes-setup-plan.md, AGENTS.md в D:\Hermes\webpage2pdf\AGENTS.md, память в C:\...\hermes\memories\MEMORY.md
