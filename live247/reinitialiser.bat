@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Fawzeyni TV - Reinitialiser les xassida
echo ============================================
echo   Reinitialisation des xassida
echo ============================================
echo.
echo  Cela va EFFACER tous les audios telecharges,
echo  puis re-telecharger EXACTEMENT ce qui est sur
echo  ton canal Telegram (les anciens sons retires
echo  disparaitront pour de bon).
echo.
set /p ok="Continuer ? (o/n) : "
if /i not "%ok%"=="o" (
  echo Annule.
  pause
  exit /b
)

echo.
echo [1/3] Suppression de l'ancien dossier audio...
if exist audio rmdir /s /q audio
if exist state.txt del /q state.txt
if exist playlist.txt del /q playlist.txt

echo [2/3] Re-telechargement depuis Telegram...
python download.py

echo.
echo [3/3] Termine ! Tu peux relancer demarrer.bat
echo       Le live ne contiendra QUE les sons actuels du canal.
pause
