/**
 * utils/errors.ts — Centralized, user-friendly error classification and restricted URL detection
 */

export function isRestrictedUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  return (
    lower.startsWith('chrome://') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('view-source:') ||
    lower.startsWith('devtools://') ||
    lower.startsWith('data:') ||
    lower.includes('chromewebstore.google.com') ||
    lower.includes('chrome.google.com/webstore')
  );
}

export function parseFriendlyError(rawError: any): string {
  const msg = String(rawError?.message ?? rawError ?? '');

  // 1. DevTools F12 is already attached
  if (/another debugger is already attached/i.test(msg)) {
    return (
      chrome.i18n.getMessage('errDevToolsOpen') ||
      'DevTools (F12) is already open on this tab. Please close DevTools and try again.'
    );
  }

  // 2. Restricted internal page (chrome://, webstore, etc.)
  if (
    /cannot attach to this target/i.test(msg) ||
    /cannot access a chrome:\/\//i.test(msg) ||
    /extensions gallery cannot be scripted/i.test(msg) ||
    /restricted url/i.test(msg) ||
    /url not allowed/i.test(msg)
  ) {
    return (
      chrome.i18n.getMessage('errRestrictedPage') ||
      'Cannot capture internal browser pages (chrome://, Web Store). Try on any standard website.'
    );
  }

  // 3. User closed or cancelled the yellow debugging infobar
  if (/detached by user/i.test(msg) || /canceled by user/i.test(msg)) {
    return (
      chrome.i18n.getMessage('errUserCancelled') ||
      'PDF generation was cancelled (debugging bar closed).'
    );
  }

  // 4. Tab was closed during generation
  if (
    /no tab with id/i.test(msg) ||
    /target closed/i.test(msg) ||
    /session closed/i.test(msg)
  ) {
    return (
      chrome.i18n.getMessage('errTabClosed') ||
      'The tab was closed before the PDF could be created.'
    );
  }

  // 5. No active tab found
  if (/no active tab/i.test(msg)) {
    return (
      chrome.i18n.getMessage('logActiveTab') ||
      'No active tab found.'
    );
  }

  // Fallback: clean technical prefix and return friendly format
  const cleanMsg = msg.replace(/^Error:\s*/i, '').slice(0, 120);
  const template = chrome.i18n.getMessage('errGeneric') || 'Failed to generate PDF: $1';
  return template.replace('$1', cleanMsg);
}
