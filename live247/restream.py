"""Re-diffuse un live YouTube vers ta chaîne Fawzeyni TV (YouTube + TikTok).

Usage :
    python restream.py https://www.youtube.com/watch?v=XXXXX

Nécessite :
    pip install yt-dlp   (inclus dans requirements.txt)

Cas d'usage légaux :
    - Chaîne que tu possèdes toi-même
    - Accord écrit avec la chaîne source (dahira, mosquée, partenaire)
    - Contenu en domaine public / licence libre
"""
import sys
import subprocess
import time

try:
    from config import STREAM_KEY
    try:
        from config import TIKTOK_SERVER, TIKTOK_STREAM_KEY
    except ImportError:
        TIKTOK_SERVER = ""
        TIKTOK_STREAM_KEY = ""
except ImportError:
    print("❌ config.py introuvable. Lance setup.py d'abord.")
    sys.exit(1)

RTMP_YT = f"rtmp://a.rtmp.youtube.com/live2/{STREAM_KEY}"
RTMP_TT = f"{TIKTOK_SERVER}{TIKTOK_STREAM_KEY}" if (TIKTOK_SERVER and TIKTOK_STREAM_KEY) else None


def build_destinations():
    dests = [f"[f=flv:onfail=ignore]{RTMP_YT}"]
    if RTMP_TT:
        dests.append(f"[f=flv:onfail=ignore]{RTMP_TT}")
        print("📡 Re-streaming → YouTube + TikTok")
    else:
        print("📡 Re-streaming → YouTube uniquement")
    return "|".join(dests)


def get_stream_url(youtube_url):
    print("🔄 Récupération du flux source via yt-dlp…")
    result = subprocess.run(
        [sys.executable, "-m", "yt_dlp", "-f", "best[ext=mp4]/best", "--get-url", youtube_url],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"❌ Impossible de récupérer le flux :\n{result.stderr}")
        sys.exit(1)
    return result.stdout.strip().splitlines()[0]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("Usage : python restream.py <URL_DU_LIVE_YOUTUBE>")
        sys.exit(1)

    url = sys.argv[1]
    print(f"🔗 Source : {url}")

    while True:
        stream_url = get_stream_url(url)
        cmd = [
            "ffmpeg",
            # Reconnexion auto si l'URL de la source live coupe/expire
            "-reconnect", "1", "-reconnect_streamed", "1",
            "-reconnect_delay_max", "5",
            # PAS de "-re" : la source est déjà en direct (temps réel)
            "-i", stream_url,
            "-c:v", "libx264", "-preset", "veryfast",
            "-pix_fmt", "yuv420p", "-b:v", "2500k", "-maxrate", "2500k",
            "-bufsize", "6000k", "-r", "30", "-g", "60",
            "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
            "-f", "tee", build_destinations(),
        ]
        print("🔴 Re-diffusion en cours… (Ctrl+C pour arrêter)")
        subprocess.run(cmd)
        print("⚠️  Flux interrompu — redémarrage dans 10s…")
        time.sleep(10)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⏹️  Re-diffusion arrêtée.")
