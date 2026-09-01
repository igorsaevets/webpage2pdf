# Native Host для кастомного пути (вне Downloads)

Chrome `chrome.downloads` может писать **только** в папку Загрузки (и подпапки внутри неё). Чтобы сохранять в `D:\MyPdfs` или `\server\share` — нужен Native Messaging host.

## Установка (Windows)

1. Закрой Chrome.
2. Правой кнопкой → Запуск от имени администратора на `install_host.bat` (он пропишет реестр `HKCU\Software\Google\Chrome\NativeMessagingHosts\com.webpage2pdf.host`).
3. Открой Chrome, `chrome://extensions` → reload webpage2pdf.
4. В настройках выбери **Кастомный путь** → `D:\MyPdfs` → Save as PDF — файл появится там.

## Удаление
Запусти `uninstall_host.bat`.

## Как работает
- Расширение шлёт `chrome.runtime.sendNativeMessage('com.webpage2pdf.host', {action:'save', dir, filename, data: base64})`
- `host.py` (python) декодирует base64 и пишет `path.join(dir, filename)` (создаёт папки).
- Если хост не установлен — расширение падает в Downloads с `warning: native_host_missing`.

Серам: хост — это локальный .exe/.py, не сеть. Данные не уходят никуда.
