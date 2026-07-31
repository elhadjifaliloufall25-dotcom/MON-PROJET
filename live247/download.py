"""Télécharge et synchronise les fichiers audio xassida depuis ton canal Telegram.
- Télécharge les nouveaux fichiers audio
- Supprime les fichiers locaux dont le message a été supprimé du canal
- Gère les canaux PRIVÉS : liste numérotée si le nom ne correspond pas
"""
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


async def resolve_channel():
    if CHANNEL:
        try:
            return await client.get_entity(CHANNEL)
        except Exception:
            pass

    dialogs = await client.get_dialogs()

    if CHANNEL:
        target = str(CHANNEL).strip().lower()
        for d in dialogs:
            if d.name and d.name.strip().lower() == target:
                return d.entity
        for d in dialogs:
            if d.name and target in d.name.strip().lower():
                return d.entity

    choices = [d for d in dialogs if d.is_channel or d.is_group]
    if not choices:
        raise SystemExit("❌ Aucun canal trouvé. Rejoins/crée ton canal de xassida d'abord.")
    print("\n📋 Tes canaux et groupes Telegram :")
    for i, d in enumerate(choices, 1):
        print(f"   [{i}] {d.name}")
    while True:
        sel = input("\n👉 Tape le NUMÉRO de ton canal de xassida : ").strip()
        if sel.isdigit() and 1 <= int(sel) <= len(choices):
            return choices[int(sel) - 1].entity
        print("   Numéro invalide, réessaie.")


def sync_deleted(telegram_ids):
    """Supprime les fichiers locaux dont le message n'existe plus sur Telegram."""
    deleted = 0
    for fname in os.listdir(AUDIO_DIR):
        if not fname.lower().endswith(AUDIO_EXT):
            continue
        parts = fname.split("_", 1)
        if not parts[0].isdigit():
            continue
        if int(parts[0]) not in telegram_ids:
            path = os.path.join(AUDIO_DIR, fname)
            os.remove(path)
            print(f"🗑️  Supprimé (retiré du canal) : {fname}")
            deleted += 1
    return deleted


async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    await client.start()
    print("✅ Connecté à Telegram.")
    channel = await resolve_channel()
    print(f"📡 Canal sélectionné : {getattr(channel, 'title', channel)}")
    print("🔎 Synchronisation des audios…")

    new = 0
    telegram_ids = set()

    async for msg in client.iter_messages(channel):
        if not is_audio(msg):
            continue
        telegram_ids.add(msg.id)
        base = (msg.file.name if msg.file and msg.file.name else f"xassida_{msg.id}.mp3")
        path = os.path.join(AUDIO_DIR, f"{msg.id}_{base}")
        if os.path.exists(path):
            continue
        print(f"⬇️  {base}")
        await msg.download_media(file=path)
        new += 1

    deleted = sync_deleted(telegram_ids)
    total = len([f for f in os.listdir(AUDIO_DIR) if f.lower().endswith(AUDIO_EXT)])
    print(f"\n✅ {new} ajouté(s) — {deleted} supprimé(s) — {total} xassida au total dans '{AUDIO_DIR}'.")


with client:
    client.loop.run_until_complete(main())
