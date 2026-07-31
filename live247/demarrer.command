#!/bin/bash
cd "$(dirname "$0")"
echo "============================================"
echo "  Fawzeyni TV - Live 24/7"
echo "============================================"
echo

echo "[1/4] Installation des dependances..."
pip3 install -r requirements.txt

if [ ! -f config.py ]; then
  echo
  echo "[2/4] Premiere configuration..."
  python3 setup.py
fi

echo
echo "[3/4] Telechargement des xassida depuis Telegram..."
python3 download.py

echo
echo "[4/4] Demarrage du LIVE 24/7..."
python3 stream.py
