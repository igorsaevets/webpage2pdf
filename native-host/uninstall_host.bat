@echo off
reg delete "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.webpage2pdf.host" /f
echo Unregistered. Restart Chrome.
pause
