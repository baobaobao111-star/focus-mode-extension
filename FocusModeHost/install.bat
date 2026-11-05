@echo off
title Cai dat Focus Mode Native Host
color 0A

:: 1. Kiem tra quyen Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] LOI: Vui long nhap chuot phai vao file install.bat va chon "Run as Administrator".
    pause
    exit /b
)

echo =======================================================
echo     CAI DAT FOCUS MODE NATIVE HOST (CHAN GAME PC)
echo =======================================================
echo.
echo Buoc 1: Vao trinh duyet, mo trang chrome://extensions/
echo Buoc 2: Tim den tien ich Focus Mode ban vua tai len
echo Buoc 3: Copy day ID (gom 32 chu cai)
echo.

:: 2. Yeu cau nguoi dung nhap ID cua ho
set /p EXT_ID="Dan (Paste) ID cua ban vao day va nhan Enter: "

:: 3. Tu dong lay duong dan thu muc hien tai va chuyen doi dau \ thanh \\
set "HOST_DIR=%~dp0"
set "HOST_DIR_JSON=%HOST_DIR:\=\\%"

:: 4. Tu dong tao file com.focusmode.killer.json voi du lieu cua rieng may do
echo.
echo [*] Dang tao file cau hinh ket noi...
(
  echo {
  echo   "name": "com.focusmode.killer",
  echo   "description": "Python Process Killer for Focus Mode",
  echo   "path": "%HOST_DIR_JSON%host.bat",
  echo   "type": "stdio",
  echo   "allowed_origins": [
  echo     "chrome-extension://%EXT_ID%/"
  echo   ]
  echo }
) > "%~dp0com.focusmode.killer.json"

:: 5. Dang ky file JSON vua tao vao Windows Registry
echo [*] Dang dang ky he thong voi Chrome...
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.focusmode.killer" /ve /t REG_SZ /d "%~dp0com.focusmode.killer.json" /f

echo.
echo =======================================================
echo [OK] CAI DAT THANH CONG! 
echo He thong chan Game da duoc ket noi voi Extension.
echo Ban co the dong cua so nay va trai nghiem tinh nang.
echo =======================================================
pause