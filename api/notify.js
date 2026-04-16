const twilio = require('twilio');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { client_nom, article, montant, paiement, vendeur_phone } = req.body;

  const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_TOKEN
  );

  const message = `🛒 *Nouvelle commande Jaayma !*

👤 Client : ${client_nom}
📦 Article : ${article}
💰 Montant : ${montant.toLocaleString()} FCFA
💳 Paiement : ${paiement}

Connecte-toi sur Jaayma pour gérer cette commande.`;

  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+221${vendeur_phone}`,
      body: message
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
