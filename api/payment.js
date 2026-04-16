export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { montant, description, client_nom, client_phone, commande_id } = req.body;

  const apiKey = process.env.PAYTECH_API_KEY;
  const secretKey = process.env.PAYTECH_SECRET_KEY;

  const payload = {
    item_name: description,
    item_price: montant,
    currency: "XOF",
    ref_command: commande_id || `CMD-${Date.now()}`,
    command_name: `Commande Jaayma - ${client_nom}`,
    env: "prod",
    ipn_url: `https://mon-projet-cyan.vercel.app/api/payment-confirm`,
    success_url: `https://mon-projet-cyan.vercel.app?status=success`,
    cancel_url: `https://mon-projet-cyan.vercel.app?status=cancel`,
    custom_field: JSON.stringify({ client_nom, client_phone }),
  };

  const response = await fetch("https://paytech.sn/api/payment/request-payment", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "API_KEY": apiKey,
      "API_SECRET": secretKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.success === 1) {
    res.status(200).json({ payment_url: data.redirect_url });
  } else {
    res.status(500).json({ error: data.message || "Erreur PayTech" });
  }
}
