# webpage2pdf — AGENTS.md (D:\Hermes\webpage2pdf — cwd для этого чата)

> Прочитай ПЕРВЫМ каждый старт. Переживает /compact (диск канон).
> Root D:\Hermes\AGENTS.md — глобальные правила Hermes; этот файл — правила проекта webpage2pdf.

## Что это
Chrome extension **webpage2pdf** — сохраняет любую веб-страницу в PDF с текстовым слоем (selectable text, поиск, копипаста), не картинкой. Публикация: GitHub + Chrome Web Store.

## Рабочая папка этого чата
- **Корень проекта этого чата:** `D:\Hermes\webpage2pdf` — здесь весь код, доки, ответы, планы. Ничего не писать в `D:\Hermes\` корень (там только `archive/` и глобальные `AGENTS.md/.hermes.md`).
- **Ответы:** `D:\Hermes\webpage2pdf\answers\iteration-XX-<slug>\answer-YYYY-MM-DD.md` — одна папка на итерацию до следующего compact, verbatim копия финального сообщения чата.
- **Планы:** `D:\Hermes\webpage2pdf\.hermes\plans\` — канон для compact (см. hermes-setup-plan.md).
- **Архив:** `D:\Hermes\archive\AOS-Item15-2026-08-20` — не трогать (AOS, PII).

## Load order каждый старт
1. `D:\Hermes\webpage2pdf\AGENTS.md` (этот файл) + `D:\Hermes\AGENTS.md` (глобальный) + `C:\Users\igors\AppData\Local\hermes\memories\MEMORY.md` + `USER.md` + `SOUL.md`
2. `D:\Hermes\webpage2pdf\.hermes\plans\hermes-setup-plan.md` — план 5 итераций
3. `D:\Hermes\webpage2pdf\answers\` — история этого чата

## Браузер — твой личный Chrome
- **Не Playwright MCP** — занят Claude Code (`ms-playwright/mcp-profile-main`). Использовать `computer_use` (cua-driver background) + `desktop_preview`/`drive_preview` (preview pane, твой реальный профиль/куки).
- **Рандом между кликами:** 0–11s (`random.uniform(0,11)`) перед каждым `click` — обязательно. `browser.use_real_profile: true`, но без `close-profile` без твоего ОК.
- Капча/2FA/оплата — стоп, спросить.

## Hard rules (наследуются из D:\Hermes\AGENTS.md)
- Секреты только через `gh secret set <NAME> < file`, никогда `Read`/`cat`.
- PII токенизировать; город/улица без номера — можно.
- `publish_audit.py` до `git init`/`push`; `_comment` в JSON запрещён.
- PDF textual layer только `chrome.debugger` Page.printToPDF, не canvas/image.

## Второе мнение (в любом чате)
- Установлен `ai-second-opinion` v1.46.0: `D:\Hermes\webpage2pdf\ai-second-opinion` + `C:\Users\igors\AppData\Local\hermes\skills\model-orchestration` + `C:\Users\igors\.claude\skills\model-orchestration`
- Вызов из любого чата (абсолютный путь, из любого cwd):
  `python "C:\Users\igors\AppData\Local\hermes\skills\model-orchestration\orchestrate.py" --brief "$env:TEMP\brief.md" --marker REVIEW-DONE-01 --out "$env:TEMP\reviews" --dry-run` (free preflight, план до трат)
  `python ...\orchestrate.py --brief brief.md --marker REVIEW-DONE-01 --out reviews` — 11 cheap каналов параллельно
  `python ...\orchestrate.py --ask "вопрос"` — дешёвый one-shot (~20s, без аудита цитат)
- Триггеры: «второе мнение», «спроси у Spark/Codex/Gemini», review/verification документа — спрашивать ВСЕГДА, даже если назван один канал.
- Перед отправкой: `python routing.py` (live список, free), `python doctor.py` (ключи length only), проверять `diagnostics.json` (scrubbed).

## Анализ (твой стандарт, 2026-09-01)
Adaptive thinking полный бюджет, первая интуиция может быть ошибочна — перепроверять логику математически, перебирать все альтернативы, проверять противоречия, смотреть с разных точек, скрытые факторы, без лимита токенов. Всегда предлагать серые/неофициальные варианты. Ничего не выдумывать — «не знаю».

## Итерации (одна за промт, см. .hermes/plans/hermes-setup-plan.md)
1. скаффолд, 2. ядро PDF, 3. UI/e2e, 4. GitHub, 5. CWS
