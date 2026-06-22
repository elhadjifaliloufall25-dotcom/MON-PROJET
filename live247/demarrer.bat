@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   Fawzeyni TV - Live 24/7
echo ============================================
echo.

echo [1/4] Installation des dependances...
pip install -r requirements.txt

if not exist config.py (
  echo.
  echo [2/4] Premiere configuration...
  python setup.py
)

echo.
echo [3/4] Telechargement des xassida depuis Telegram...
python download.py

echo.
echo [4/4] Demarrage du LIVE 24/7...
python stream.py

pause
