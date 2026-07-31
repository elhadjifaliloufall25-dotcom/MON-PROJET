"""Assistant de configuration — crée config.py automatiquement.
Lance simplement : python setup.py   (puis réponds aux questions)
"""
import os

print("\n=========================================")
print("  Fawzeyni TV — Configuration du Live 24/7")
print("=========================================\n")

if os.path.exists("config.py"):
    r = input("⚠️  config.py existe déjà. Le remplacer ? (o/n) : ").strip().lower()
    if r not in ("o", "oui", "y", "yes"):
        print("Annulé. config.py inchangé.")
        raise SystemExit

print("Récupère API_ID et API_HASH sur https://my.telegram.org\n")

while True:
    api_id = input("1. API_ID (le nombre) : ").strip()
    if api_id.isdigit():
        break
    print("   ❌ L'API_ID doit être un nombre. Réessaie.")

api_hash = input("2. API_HASH (le code) : ").strip()
channel = input("3. Nom de ton canal Telegram (username sans @, ou lien) : ").strip()
stream_key = input("4. Clé de stream YouTube (laisse VIDE si pas encore) : ").strip()
tiktok_key = input("5. Clé de stream TikTok (laisse VIDE si pas encore) : ").strip()

content = f'''# Généré automatiquement par setup.py
API_ID = {api_id}
API_HASH = "{api_hash}"
CHANNEL = "{channel}"
STREAM_KEY = "{stream_key}"
TIKTOK_SERVER = "rtmp://push.tiktokv.com/live/"
TIKTOK_STREAM_KEY = "{tiktok_key}"

AUDIO_DIR = "audio"
IMAGE_PATH = "cover.jpg"
'''

with open("config.py", "w", encoding="utf-8") as f:
    f.write(content)

print("\n✅ config.py créé avec succès !")
if not stream_key:
    print("ℹ️  Pense à rajouter ta STREAM_KEY YouTube plus tard (relance setup.py).")
if not tiktok_key:
    print("ℹ️  Pense à rajouter ta TIKTOK_STREAM_KEY plus tard (relance setup.py).")
print("\nÉtape suivante : python download.py\n")
