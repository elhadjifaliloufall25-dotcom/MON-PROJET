@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Fawzeyni TV - Live 24/7
echo ============================================
echo    Fawzeyni TV - Installation et Live 24/7
echo ============================================
echo.

set NEEDRESTART=0

REM --- winget disponible ? ---
where winget >nul 2>nul
if errorlevel 1 (
  echo [X] "winget" introuvable ^(Windows trop ancien^).
  echo     Installe Python et FFmpeg manuellement - voir README.md
  pause
  exit /b
)

REM --- Python installe ? ---
python --version >nul 2>nul
if errorlevel 1 (
  echo [!] Python manquant - installation automatique en cours...
  winget install -e --id Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements
  set NEEDRESTART=1
) else (
  echo [OK] Python detecte.
)

REM --- FFmpeg installe ? ---
ffmpeg -version >nul 2>nul
if errorlevel 1 (
  echo [!] FFmpeg manquant - installation automatique en cours...
  winget install -e --id Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements
  set NEEDRESTART=1
) else (
  echo [OK] FFmpeg detecte.
)

if "%NEEDRESTART%"=="1" (
  echo.
  echo ===========================================================
  echo  Installation terminee !
  echo  1^) FERME cette fenetre
  echo  2^) DOUBLE-CLIQUE a nouveau sur demarrer.bat
  echo ===========================================================
  pause
  exit /b
)

echo.
echo [1/3] Installation des dependances Python...
python -m pip install --upgrade pip >nul 2>nul
python -m pip install -r requirements.txt

if not exist config.py (
  echo.
  echo [2/3] Configuration ^(premiere fois^)...
  python setup.py
)

echo.
echo [3/3] Telechargement des xassida + LIVE 24/7...
python download.py
python stream.py

pause
