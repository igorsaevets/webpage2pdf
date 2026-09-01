# Store listing — webpage2pdf

## Title (≤45)
webpage2pdf — desktop PDF with text

## Short description (≤132, first sentence = core purpose)
Save any webpage as a real PDF with selectable text — desktop layout, not mobile. One click, A4/Letter.

## Full description (overview + bullets, no keyword spam)
**Fix Chrome's broken “Save as PDF” — get the desktop layout, not a 740px mobile collapse, with real selectable text.**

Chrome's print path renders at ~740px (Letter 8.5in minus margins), so sites collapse to mobile at breakpoints 768/991/1024. Bootstrap/WordPress/Elementor grids, images, headers and fonts break. This extension prints what you actually see on desktop.

**How it works (no server, 100% local):**
- Emulates a 1920px desktop viewport via chrome.debugger, forces `printBackground` and selectable text via `Page.printToPDF`.
- Pre-loads lazy images (`data-src` → `src`), CSS `background-image` (up to 5000 elements), and hidden slider images (Swiper/Slick/Bootstrap/Owl/Flickity/Splide) with staged scrolling — then prints.
- Keeps page translation (Google Translate / DeepL) by printing the live tab.
- Footer on every page: page URL (wraps to 2 lines), no pagination spam.

**Features:**
- A4 or US Letter, correct scale math `(paperWidth-0.8)*96/1920`, margins 0.4in, footer 0.6in.
- 3 save modes: Ask where to save / Auto to Downloads (optional subfolder) / Custom absolute path (optional Native Host).
- Filename: `host-path + YYYY-MM-DD` (e.g. `krokitclub.com-2026-09-01.pdf`).
- 100% local — no uploads, no analytics, no remote code.

**Permissions — why:**
- `debugger` → desktop emulation + PDF rendering
- `downloads` → save PDF; `storage` → remember paper/mode; `scripting` → handle lazy/translation

Open source. Privacy policy: no data collection.

## Category
Productivity

## Language
English (EN), Russian (RU) — add later via locales

## Single purpose (Privacy tab)
Save the currently open webpage as a PDF that looks exactly like the desktop version in Chrome, with selectable text and the page URL in the footer.

## Screenshots to capture (1280×800, 5 max)
1. Popup — “Save as PDF (desktop)” button + paper/mode hint
2. Options — A4/Letter + 3 save modes
3. Before/After: naive print (740px collapsed) vs plugin PDF (desktop, side-by-side)
4. PDF opened in viewer — text selectable (highlight)
5. Footer URL wrapping on long URL (biznespark.by example)

## Promo tiles
- Small 440×280: icon + “Desktop PDF with selectable text” on white
- Marquee 1400×560 (optional): same hero, larger

## Permissions justification (Privacy tab → Permission justification)
- `debugger`: Required to emulate desktop viewport (1920px, Emulation.setDeviceMetricsOverride + setEmulatedMedia) and invoke Page.printToPDF with printBackground and tagged PDF — no other API can print desktop layout with text layer.
- `downloads`: Required to save the generated PDF via downloads.download; filename is sanitized host-path + date.
- `storage`: Required to persist user preferences (paper size, save mode, subfolder) via storage.sync.
- `scripting`: Required to detect translated pages and to inject helpers that convert lazy images and background images to loadable form before printing.
- `nativeMessaging`: Optional, only for custom absolute-path saves; without the host the extension gracefully falls back to Downloads.

## Notes for reviewer (Test instructions tab)
- Load any page (e.g. https://krokitclub.com/), click the extension icon → Save as PDF → file appears in Downloads or Save As dialog.
- Check: PDF text is selectable, layout matches desktop viewport, footer shows URL, paper respects Options.
- No remote code, no external requests during save. Native host is optional and open-source in native-host/.
