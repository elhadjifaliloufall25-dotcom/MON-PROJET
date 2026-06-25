"""Diffuse les xassida en live 24/7 sur YouTube + TikTok (image fixe + audio en boucle)."""
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
PLAYLIST = "playlist.txt"


def order_key(name):
    """Trie par l'ID Telegram en préfixe (numérique) = du plus ancien au plus récent.
    Les fichiers sans préfixe numérique passent à la fin."""
    prefix = name.split("_", 1)[0]
    return (0, int(prefix)) if prefix.isdigit() else (1, name)


def build_playlist():
    files = sorted(
        (f for f in os.listdir(AUDIO_DIR) if f.lower().endswith(AUDIO_EXT)),
        key=order_key,
    )
    if not files:
        print(f"❌ Aucun fichier audio dans '{AUDIO_DIR}'. Lance d'abord : python download.py")
        sys.exit(1)
    with open(PLAYLIST, "w", encoding="utf-8") as f:
        for name in files:
            p = os.path.abspath(os.path.join(AUDIO_DIR, name)).replace("'", "'\\''")
            f.write(f"file '{p}'\n")
    print(f"🎵 {len(files)} xassida dans la playlist.")


def build_destinations():
    dests = [f"[f=flv:onfail=ignore]{RTMP_YT}"]
    if RTMP_TT:
        dests.append(f"[f=flv:onfail=ignore]{RTMP_TT}")
        print("📡 Streaming → YouTube + TikTok")
    else:
        print("📡 Streaming → YouTube uniquement (ajoute TIKTOK_STREAM_KEY dans config.py pour TikTok)")
    return "|".join(dests)


def ffmpeg_cmd():
    return [
        "ffmpeg",
        "-re",
        "-loop", "1", "-framerate", "2", "-i", IMAGE_PATH,
        "-stream_loop", "-1", "-f", "concat", "-safe", "0", "-i", PLAYLIST,
        "-map", "0:v", "-map", "1:a",
        "-c:v", "libx264", "-preset", "veryfast", "-tune", "stillimage",
        "-pix_fmt", "yuv420p", "-b:v", "2500k", "-maxrate", "2500k",
        "-bufsize", "6000k", "-r", "30", "-g", "60",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
        "-f", "tee", build_destinations(),
    ]


def main():
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Image '{IMAGE_PATH}' introuvable. Mets ta couverture (1920x1080) ici.")
        sys.exit(1)
    while True:
        build_playlist()
        print("🔴 LIVE 24/7 en cours… (Ctrl+C pour arrêter)")
        subprocess.run(ffmpeg_cmd())
        print("⚠️  Flux interrompu — redémarrage dans 5s…")
        time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⏹️  Live arrêté.")
