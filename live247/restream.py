"""Re-diffuse un live YouTube vers ta chaîne Fawzeyni TV.

Usage :
    python restream.py https://www.youtube.com/watch?v=XXXXX

Option marque : si un fichier "overlay.png" (1280x720, fond transparent)
est présent dans le dossier, il est posé PAR-DESSUS la vidéo. Ça permet
de recouvrir les logos/bandeaux de la chaîne source avec les tiens.
"""
import os
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
OVERLAY = "overlay.png"   # ta marque (logo + bannière) sur fond transparent
W, H = 1280, 720          # résolution de sortie


def video_filter():
    """Construit le filtre vidéo : image source + ta marque par-dessus."""
    if os.path.exists(OVERLAY):
        print(f"🎨 Marque appliquée : {OVERLAY}")
        return (
            f"[0:v]scale={W}:{H},setsar=1[base];"
            f"[1:v]scale={W}:{H}[mark];"
            f"[base][mark]overlay=0:0[v]"
        )
    print("ℹ️  Pas de overlay.png → vidéo diffusée telle quelle "
          "(mets un overlay.png 1280x720 transparent pour ta marque).")
    return None


def main():
    if len(sys.argv) < 2:
        print("Usage : python restream.py <URL_DU_LIVE_YOUTUBE>")
        sys.exit(1)

    url = sys.argv[1]
    print(f"\n🔑 Clé YouTube : {STREAM_KEY[:4]}****")
    print(f"🔗 Source      : {url}")
    print("⚠️  demarrer.bat doit être FERMÉ (une seule diffusion par clé).\n")

    while True:
        print("🔄 Connexion à la source…")

        yt_cmd = [
            sys.executable, "-m", "yt_dlp",
            "-f", "best", "--no-part", "--quiet",
            "-o", "-", url,
        ]

        vf = video_filter()
        ff_cmd = ["ffmpeg", "-re", "-i", "pipe:0"]
        if vf:
            ff_cmd += ["-i", OVERLAY, "-filter_complex", vf, "-map", "[v]", "-map", "0:a"]
        ff_cmd += [
            "-c:v", "libx264", "-preset", "veryfast",
            "-pix_fmt", "yuv420p", "-b:v", "2500k", "-maxrate", "2500k",
            "-bufsize", "6000k", "-r", "30", "-g", "60",
            "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
            "-f", "flv", RTMP_YT,
        ]
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
