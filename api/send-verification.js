export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { phone } = req.body;
  if (!phone || phone.length < 8) {
    return res.status(400).json({ error: "Numéro invalide" });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const supaUrl = process.env.VITE_SUPABASE_URL;
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY;
  const twilioSid = process.env.TWILIO_SID;
  const twilioToken = process.env.TWILIO_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE; // optionnel pour SMS

  // 1. Enregistrer le code dans Supabase (upsert)
  try {
    const r = await fetch(`${supaUrl}/rest/v1/verifications`, {
      method: "POST",
      headers: {
        apikey: supaKey,
        Authorization: `Bearer ${supaKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ phone, code, expires_at, verified: false }),
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).json({ error: `Supabase: ${txt}` });
    }
  } catch (e) {
    return res.status(500).json({ error: "Erreur Supabase" });
  }

  const recipientPhone = `+221${phone}`;
  const message = `Votre code Jaayma : ${code}\n\nValable 5 minutes. Ne le partagez pas.`;
  const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
  const twilioBase = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;

  const results = [];

  // 2. Tentative SMS (seulement si TWILIO_PHONE est configuré)
  if (twilioPhone) {
    try {
      const r = await fetch(twilioBase, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Body: message, From: twilioPhone, To: recipientPhone }),
      });
      const data = await r.json();
      results.push({ canal: "SMS", ok: r.ok, sid: data.sid, error: data.message });
    } catch (e) {
      results.push({ canal: "SMS", ok: false, error: e.message });
    }
  }

  // 3. Tentative WhatsApp sandbox (toujours essayé)
  try {
    const r = await fetch(twilioBase, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        Body: message,
        From: "whatsapp:+14155238886",
        To: `whatsapp:${recipientPhone}`,
      }),
    });
    const data = await r.json();
    results.push({ canal: "WhatsApp", ok: r.ok, sid: data.sid, error: data.message });
  } catch (e) {
    results.push({ canal: "WhatsApp", ok: false, error: e.message });
  }

  const anySent = results.some((r) => r.ok);
  res.status(200).json({ ok: true, sent: anySent, results });
}
