"""Re-diffuse un live YouTube vers ta chaîne Fawzeyni TV.

Usage :
    python restream.py https://www.youtube.com/watch?v=XXXXX
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
    print("❌ config.py introuvable. Ouvre le terminal dans le dossier qui contient config.py.")
    sys.exit(1)

if not STREAM_KEY:
    print("❌ STREAM_KEY vide dans config.py.")
    sys.exit(1)

RTMP_YT = f"rtmp://a.rtmp.youtube.com/live2/{STREAM_KEY}"
RTMP_TT = f"{TIKTOK_SERVER}{TIKTOK_STREAM_KEY}" if (TIKTOK_SERVER and TIKTOK_STREAM_KEY) else None


def main():
    if len(sys.argv) < 2:
        print("Usage : python restream.py <URL_DU_LIVE_YOUTUBE>")
        sys.exit(1)

    url = sys.argv[1]

    # Diagnostic : affiche les 4 premiers caractères de la clé pour vérification
    key_preview = STREAM_KEY[:4] + "****"
    print(f"\n🔑 Clé YouTube utilisée : {key_preview}")
    print(f"📡 RTMP YouTube : {RTMP_YT[:45]}...")
    if RTMP_TT:
        print(f"📡 RTMP TikTok  : {RTMP_TT[:45]}...")
    print(f"🔗 Source        : {url}")
    print("\n⚠️  IMPORTANT : demarrer.bat doit être FERMÉ avant de continuer.")
    print("    Une seule diffusion à la fois sur la même clé YouTube.\n")

    while True:
        print("🔄 Connexion à la source…")

        # yt-dlp récupère le flux live et le pipe dans ffmpeg
        yt_cmd = [
            sys.executable, "-m", "yt_dlp",
            "-f", "best",
            "--no-part", "--quiet",
            "-o", "-", url,
        ]

        # ffmpeg lit le pipe, ré-encode H264/AAC et envoie vers YouTube
        ff_cmd = [
            "ffmpeg", "-re",
            "-i", "pipe:0",
            "-c:v", "libx264", "-preset", "veryfast",
            "-pix_fmt", "yuv420p", "-b:v", "2500k", "-maxrate", "2500k",
            "-bufsize", "6000k", "-r", "30", "-g", "60",
            "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
            "-f", "flv", RTMP_YT,
        ]

        # Si TikTok configuré, ajouter comme 2ème sortie
        if RTMP_TT:
            ff_cmd += ["-f", "flv", RTMP_TT]

        yt = subprocess.Popen(yt_cmd, stdout=subprocess.PIPE)
        ff = subprocess.Popen(ff_cmd, stdin=yt.stdout)
        yt.stdout.close()

        print("🔴 Re-diffusion en cours… (Ctrl+C pour arrêter)")
        try:
            ff.wait()
        finally:
            for p in (ff, yt):
                if p.poll() is None:
                    p.terminate()

        print("⚠️  Flux interrompu — redémarrage dans 10s…")
        time.sleep(10)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⏹️  Re-diffusion arrêtée.")
