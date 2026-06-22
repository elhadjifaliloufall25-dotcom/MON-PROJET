"""Télécharge les fichiers audio xassida depuis ton canal Telegram."""
import os
from telethon import TelegramClient
from config import API_ID, API_HASH, CHANNEL, AUDIO_DIR

AUDIO_EXT = (".mp3", ".m4a", ".aac", ".ogg", ".opus", ".wav", ".flac")
client = TelegramClient("fawzeyni_session", API_ID, API_HASH)


def is_audio(msg):
    if msg.audio or msg.voice:
        return True
    doc = getattr(msg, "document", None)
    mime = getattr(doc, "mime_type", "") or ""
    if mime.startswith("audio"):
        return True
    name = msg.file.name if msg.file else None
    return bool(name and name.lower().endswith(AUDIO_EXT))


async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    await client.start()
    print("✅ Connecté à Telegram. Recherche des audios…")
    new = 0
    async for msg in client.iter_messages(CHANNEL):
        if not is_audio(msg):
            continue
        base = (msg.file.name if msg.file and msg.file.name else f"xassida_{msg.id}.mp3")
        path = os.path.join(AUDIO_DIR, f"{msg.id}_{base}")
        if os.path.exists(path):
            continue
        print(f"⬇️  {base}")
        await msg.download_media(file=path)
        new += 1
    total = len([f for f in os.listdir(AUDIO_DIR) if f.lower().endswith(AUDIO_EXT)])
    print(f"\n🎉 {new} nouveau(x) fichier(s) — {total} xassida au total dans '{AUDIO_DIR}'.")


with client:
    client.loop.run_until_complete(main())
