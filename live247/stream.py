"""Live 24/7 des xassida sur YouTube (+ TikTok) — image fixe + audio.

Lecture PISTE PAR PISTE avec mémoire de position :
  • Reprend EXACTEMENT où le live s'est coupé (fichier state.txt)
  • Recharge la liste des sons à chaque cycle → les nouveaux xassida
    téléchargés apparaissent tout seuls, les supprimés disparaissent
  • Ordre du plus ancien au plus récent (ID Telegram)
"""
import os
import sys
import time
import subprocess
from config import AUDIO_DIR, IMAGE_PATH, STREAM_KEY

try:
    from config import TIKTOK_SERVER, TIKTOK_STREAM_KEY
except ImportError:
    TIKTOK_SERVER = ""
    TIKTOK_STREAM_KEY = ""

AUDIO_EXT = (".mp3", ".m4a", ".aac", ".ogg", ".opus", ".wav", ".flac")
RTMP_YT = f"rtmp://a.rtmp.youtube.com/live2/{STREAM_KEY}"
RTMP_TT = f"{TIKTOK_SERVER}{TIKTOK_STREAM_KEY}" if (TIKTOK_SERVER and TIKTOK_STREAM_KEY) else None
STATE = "state.txt"


def order_key(name):
    """Tri numérique par l'ID Telegram en préfixe = du plus ancien au plus récent."""
    prefix = name.split("_", 1)[0]
    return (0, int(prefix)) if prefix.isdigit() else (1, name)


def list_audio():
    files = [f for f in os.listdir(AUDIO_DIR) if f.lower().endswith(AUDIO_EXT)]
    return sorted(files, key=order_key)


def load_position():
    """Renvoie le nom du dernier fichier joué (ou None)."""
    try:
        with open(STATE, "r", encoding="utf-8") as f:
            return f.read().strip() or None
    except FileNotFoundError:
        return None


def save_position(name):
    with open(STATE, "w", encoding="utf-8") as f:
        f.write(name)


def ffmpeg_cmd(audio_path):
    cmd = [
        "ffmpeg", "-re",
        "-loop", "1", "-framerate", "2", "-i", IMAGE_PATH,
        "-i", audio_path,
        "-map", "0:v", "-map", "1:a",
        "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage",
        "-pix_fmt", "yuv420p", "-b:v", "2500k", "-maxrate", "2500k",
        "-bufsize", "6000k", "-r", "30", "-g", "60",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
        "-shortest",
        "-f", "flv", RTMP_YT,
    ]
    if RTMP_TT:
        cmd += ["-f", "flv", RTMP_TT]
    return cmd


def main():
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Image '{IMAGE_PATH}' introuvable. Mets ta couverture (1920x1080) ici.")
        sys.exit(1)

    print("📡 Destinations :", "YouTube + TikTok" if RTMP_TT else "YouTube")
    last_played = load_position()
    if last_played:
        print(f"↩️  Reprise après : {last_played}")

    while True:
        files = list_audio()
        if not files:
            print(f"❌ Aucun audio dans '{AUDIO_DIR}'. Lance d'abord : python download.py")
            sys.exit(1)

        # Reprendre juste APRÈS le dernier fichier joué
        start = 0
        if last_played in files:
            start = files.index(last_played) + 1
            if start >= len(files):
                start = 0  # tout joué → on recommence le cycle

        print(f"🔴 LIVE 24/7 — {len(files)} xassida (départ piste {start + 1})")

        i = start
        while i < len(files):
            name = files[i]
            path = os.path.join(AUDIO_DIR, name)
            print(f"▶️  [{i + 1}/{len(files)}] {name}")
            subprocess.run(ffmpeg_cmd(path))
            save_position(name)
            last_played = name
            i += 1

        # Cycle terminé : on recharge (nouveaux sons) et on repart du début
        last_played = None
        save_position("")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⏹️  Live arrêté. (Reprise possible au même endroit au prochain lancement.)")
