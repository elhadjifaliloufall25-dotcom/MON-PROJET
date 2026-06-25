"""Re-diffuse un live YouTube vers ta chaîne Fawzeyni TV (YouTube + TikTok).

Usage :
    python restream.py https://www.youtube.com/watch?v=XXXXX

Méthode : yt-dlp télécharge le flux live et le « pipe » directement dans
FFmpeg, qui ré-encode en H.264/AAC et envoie vers YouTube (+ TikTok).
Ça évite les URLs qui expirent et le problème audio/vidéo séparés.

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
    print("❌ config.py introuvable. Ouvre le terminal dans le dossier qui contient config.py.")
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


def ytdlp_cmd(url):
    # -f best : un seul format déjà muxé (audio+vidéo) — idéal pour piper
    # -o -    : sortie sur stdout (le « tuyau »)
    return [
        sys.executable, "-m", "yt_dlp",
        "-f", "best",
        "--no-part", "--quiet", "--no-warnings",
        "-o", "-", url,
    ]


def ffmpeg_cmd():
    return [
        "ffmpeg",
        "-i", "pipe:0",                       # lit le flux venu de yt-dlp
        "-c:v", "libx264", "-preset", "veryfast",
        "-pix_fmt", "yuv420p", "-b:v", "2500k", "-maxrate", "2500k",
        "-bufsize", "6000k", "-r", "30", "-g", "60",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
        "-f", "tee", build_destinations(),
    ]


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("Usage : python restream.py <URL_DU_LIVE_YOUTUBE>")
        sys.exit(1)

    if not STREAM_KEY:
        print("❌ STREAM_KEY vide dans config.py. Ajoute ta clé YouTube d'abord.")
        sys.exit(1)

    url = sys.argv[1]
    print(f"🔗 Source : {url}")
    print("⚠️  Vérifie que demarrer.bat (live xassida) est FERMÉ — une seule")
    print("    diffusion à la fois par clé YouTube, sinon « Échec ».\n")

    while True:
        print("🔄 Connexion à la source via yt-dlp…")
        yt = subprocess.Popen(ytdlp_cmd(url), stdout=subprocess.PIPE)
        ff = subprocess.Popen(ffmpeg_cmd(), stdin=yt.stdout)
        yt.stdout.close()  # ffmpeg détient maintenant le tuyau
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
