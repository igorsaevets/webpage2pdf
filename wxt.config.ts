import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDesc__',
    default_locale: 'en',
    version: '0.5.0',
    // Minimum-permission: nativeMessaging only if user chose custom folder
    permissions: ['debugger', 'activeTab', 'downloads', 'scripting', 'storage', 'contextMenus'],
    optional_permissions: ['nativeMessaging'],
    host_permissions: ['<all_urls>'],
    action: {
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
    commands: {
      'save-page-pdf': {
        suggested_key: {
          default: 'Alt+Shift+P',
          mac: 'Alt+Shift+P',
        },
        description: '__MSG_commandSavePdf__',
      },
    },
  },
});
