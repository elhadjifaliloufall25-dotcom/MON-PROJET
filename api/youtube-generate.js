export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { type, niche, topic, title } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY manquant dans les variables d'environnement Vercel." });

  let prompt = "";
  if (type === "idees") {
    prompt = `Tu es un expert YouTube automation. Génère 6 idées de vidéos virales pour la niche : "${niche}".
Réponds UNIQUEMENT avec un JSON array (pas de texte avant ou après) :
[{"titre":"...","angle":"...","potentiel_viral":8,"duree_estimee":"8-12 min"},...]`;
  } else if (type === "script") {
    prompt = `Tu es un expert créateur YouTube. Écris un script complet pour : "${topic}".
Structure obligatoire :
🎬 HOOK (30 premières secondes – accroche forte)
📌 INTRO (présente le contenu à venir)
💡 POINT 1 : [titre] – développement détaillé
💡 POINT 2 : [titre] – développement détaillé
💡 POINT 3 : [titre] – développement détaillé
✅ CONCLUSION (résumé des points clés)
🔔 CALL TO ACTION (abonnement, like, commentaire)
Écris en français, style naturel et parlé, 600-900 mots.`;
  } else if (type === "seo") {
    prompt = `Tu es un expert SEO YouTube. Pour la vidéo : "${title}", génère :
Réponds UNIQUEMENT avec ce JSON (pas de texte avant/après) :
{"titre_seo":"titre optimisé max 70 chars","description":"description complète 800 chars avec mots-clés, timestamps, réseaux sociaux","tags":["tag1","tag2"],"miniature_idee":"description visuelle de la miniature idéale"}`;
  } else {
    return res.status(400).json({ error: "Type invalide" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data.error?.message || "Erreur API Anthropic" });

    const text = data.content[0].text;

    if (type === "idees" || type === "seo") {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : text;
        return res.status(200).json({ result: parsed });
      } catch {
        return res.status(200).json({ result: text });
      }
    }

    res.status(200).json({ result: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
