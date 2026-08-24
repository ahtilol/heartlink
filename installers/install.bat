@echo off
title HeartLink Plugin Installer
color 0D
echo ============================================================
echo         HeartLink - Vencord Plugin Automated Installer
echo              Developed by Ahti for his wife Kiki
echo ============================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"

echo.
pause
