# 🔴 Fawzeyni TV — Live 24/7 (Telegram → YouTube)

Diffuse tes xassida en **direct 24h/24** sur YouTube, à partir d'un canal Telegram.
Tu postes un xassida sur Telegram → il rejoint automatiquement la playlist du live.

C'est le même principe que les radios lofi 24/7 sur YouTube : une image fixe + ton audio en boucle.

---

## 📦 Ce qu'il te faut (une seule fois)

1. **Un PC** qui reste allumé et branché en permanence (Windows, Mac ou Linux)
2. **Python 3** installé → https://www.python.org/downloads/ (coche "Add to PATH")
3. **FFmpeg** installé :
   - Windows : https://www.gyan.dev/ffmpeg/builds/ (prends "release essentials", décompresse, ajoute le dossier `bin` au PATH)
   - Mac : `brew install ffmpeg`
   - Linux : `sudo apt install ffmpeg`

---

## 🗂️ Étape 1 — Créer ton canal Telegram

1. Ouvre Telegram → Nouveau canal → nomme-le (ex: "Fawzeyni Xassida")
2. Mets-le en **privé** (pas besoin qu'il soit public)
3. Poste tous tes fichiers audio xassida dedans (mp3, m4a…)
4. Donne-lui un nom d'utilisateur ou note son lien

## 🔑 Étape 2 — Obtenir tes accès Telegram

1. Va sur https://my.telegram.org → connecte-toi avec ton numéro
2. Clique "API development tools"
3. Crée une app (n'importe quel nom) → tu obtiens **API_ID** et **API_HASH**

## 🎥 Étape 3 — Activer le live YouTube

1. https://youtube.com/verify → vérifie ton compte par téléphone
2. YouTube Studio → Créer → **Passer en direct** (la 1ère fois : attendre 24h)
3. Onglet **"Diffuser"** (Stream) → copie ta **clé de stream**

## ⚙️ Étape 4 — Configurer le script

1. Copie le fichier `config.example.py` et renomme la copie en `config.py`
2. Ouvre `config.py` et remplis tes infos (API_ID, API_HASH, canal, clé de stream)
3. Mets ton image de couverture dans ce dossier sous le nom `cover.jpg`
   (format 1920x1080, faite sur Canva par ex.)

## ▶️ Étape 5 — Lancer

Ouvre un terminal dans ce dossier puis :

```bash
pip install -r requirements.txt    # une seule fois

python download.py                 # télécharge les xassida depuis Telegram
python stream.py                   # démarre le live 24/7 🔴
```

La 1ère fois, `download.py` te demandera ton numéro + un code Telegram (connexion sécurisée, une seule fois).

---

## 🔄 Ajouter de nouveaux xassida

1. Poste le nouveau fichier sur ton canal Telegram
2. Relance `python download.py` (récupère seulement les nouveaux)
3. Le live les prendra en compte au prochain tour de playlist

> 💡 Astuce : le live tourne en boucle infinie. `stream.py` redémarre tout seul si la connexion coupe.

---

## ⚠️ Pour un vrai 24/7

- Désactive la mise en veille du PC (Windows : Paramètres → Alimentation → Écran/Veille = "Jamais")
- Connexion internet stable (filaire de préférence)
- Upload minimum recommandé : 5 Mbps
