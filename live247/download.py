"""Télécharge les fichiers audio xassida depuis ton canal Telegram.
Gère aussi les canaux PRIVÉS : si le nom ne correspond pas, une liste
numérotée de tes canaux s'affiche pour que tu choisisses le bon.
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
    # 1) Tentative directe (username, lien d'invitation, ID)
    if CHANNEL:
        try:
            return await client.get_entity(CHANNEL)
        except Exception:
            pass

    dialogs = await client.get_dialogs()

    # 2) Correspondance par titre (canal privé nommé)
    if CHANNEL:
        target = str(CHANNEL).strip().lower()
        for d in dialogs:
            if d.name and d.name.strip().lower() == target:
                return d.entity
        for d in dialogs:
            if d.name and target in d.name.strip().lower():
                return d.entity

    # 3) Sélection manuelle par numéro
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


async def main():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    await client.start()
    print("✅ Connecté à Telegram.")
    channel = await resolve_channel()
    print(f"📡 Canal sélectionné : {getattr(channel, 'title', channel)}")
    print("🔎 Recherche des audios…")
    new = 0
    async for msg in client.iter_messages(channel):
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
