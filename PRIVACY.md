# webpage2pdf — Privacy Policy

**Last updated:** 2026-09-01
**Extension:** webpage2pdf — desktop PDF with text layer (Chrome MV3)
**Contact:** https://github.com/igorsaevets/webpage2pdf (Issues)

## Single purpose
Save the currently open webpage as a PDF that looks exactly like the desktop version in Chrome, with selectable text and the page URL in the footer.

## What data we access
- **Page content** (DOM, images, styles) of the active tab — only when you click “Save as PDF”. Content is rendered via Chrome DevTools Protocol (`Page.printToPDF`) into a PDF entirely inside your browser.

## What we collect, store, or transmit
- **We do not collect, store, or transmit any personal data to any server.** The extension works fully offline after installation.
- **No analytics, no tracking, no ads, no remote code.**
- All settings (paper size A4/Letter, save mode, subfolder name) are stored locally via `chrome.storage.sync` and never leave your device.
- The generated PDF is saved only where you choose:
  - Default: your Chrome Downloads folder (via `chrome.downloads.download`), or a subfolder inside it if you set one.
  - Optional (advanced): a custom absolute path via an optional Native Messaging host (`com.webpage2pdf.host`, Python, open-source in `native-host/`). In that mode the PDF base64 is sent over `stdin` to the locally installed host, which writes the file and never uploads it.

## Permissions — why each is needed (Minimum Permission)
- `debugger` — attach to the current tab to emulate desktop viewport (1920px) and call `Page.printToPDF` with background graphics and selectable text.
- `activeTab` / `<all_urls>` — access the current page content only upon your click.
- `downloads` — save the resulting PDF.
- `storage` — remember your paper/save preferences.
- `scripting` — detect translated pages (Google Translate / DeepL) to preserve translation; inject helpers for lazy images.
- `nativeMessaging` — optional; only if you install the separate host to save outside Downloads. Without the host the extension falls back to Downloads and shows a warning.

## Third-party sharing
None. No data is shared with any third party.

## Retention
Settings persist until you uninstall the extension or reset them in Options. PDFs are files on your disk — we do not retain copies.

## Changes
If the single purpose or handling changes, this policy will be updated and the Store listing will reflect it before the next submission.

## Questions
Open an issue at the GitHub repo above.
