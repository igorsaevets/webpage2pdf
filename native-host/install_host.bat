@echo off
REM Install native host for webpage2pdf custom path
setlocal
set HOST_NAME=com.webpage2pdf.host
set HOST_DIR=%~dp0
set HOST_JSON=%HOST_DIR%com.webpage2pdf.host.json
set HOST_BAT=%HOST_DIR%host.bat

REM Create host.bat wrapper that runs python host.py
echo @echo off > "%HOST_BAT%"
echo python "%%~dp0host.py" >> "%HOST_BAT%"

REM Get extension ID — user must edit after first Load unpacked
echo NOTE: Edit %HOST_JSON% and replace __REPLACE_WITH_EXTENSION_ID__ with real extension ID from chrome://extensions
echo Also set "path" to absolute path of host.bat: %HOST_BAT%
echo.

REM Write host json from template
powershell -Command "$t=Get-Content '%HOST_DIR%com.webpage2pdf.host.json.template' -Raw; $t=$t -replace 'REPLACE_WITH_ABSOLUTE_PATH_TO_host.bat', ('%HOST_BAT%' -replace '\\','\\'); $t=$t -replace '__REPLACE_WITH_EXTENSION_ID__', 'REPLACE_ME'; Set-Content -Path '%HOST_JSON%' -Value $t -Encoding UTF8; Write-Host \"Wrote %HOST_JSON%\""

REM Register in HKCU
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\%HOST_NAME%" /ve /t REG_SZ /d "%HOST_JSON%" /f
if %errorlevel% neq 0 (
  echo FAILED to write registry. Try run as Administrator.
  pause
  exit /b 1
)
echo Registered %HOST_NAME% -> %HOST_JSON%
echo Done. Now edit %HOST_JSON% extension ID, then restart Chrome.
pause
