import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'webpage2pdf — desktop PDF with text layer',
    description: 'Save any webpage as a real PDF with selectable text — desktop layout, not mobile. One click → A4/Letter.',
    version: '0.4.1',
    // Minimum-permission: nativeMessaging only if user chose custom folder
    permissions: ['debugger', 'activeTab', 'downloads', 'scripting', 'storage'],
    optional_permissions: ['nativeMessaging'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: 'Save as PDF (desktop)',
      default_popup: 'popup.html',
      default_icon: {
        16: 'icon-16.png',
        32: 'icon-32.png',
        48: 'icon-48.png',
        128: 'icon-128.png',
      },
    },
    icons: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: false,
    },
  },
});
