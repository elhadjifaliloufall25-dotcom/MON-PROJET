export default async function handler(req, res) {
  const { phone, client, article, montant, paiement } = req.query;

  const accountSid = process.env.TWILIO_SID;
  const authToken = process.env.TWILIO_TOKEN;

  const message = `🛒 *Nouvelle commande Jaayma !*\n\n👤 Client : ${client}\n📦 Article : ${article}\n💰 Montant : ${montant} FCFA\n💳 Paiement : ${paiement}`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'whatsapp:+14155238886',
        To: `whatsapp:+221${phone}`,
        Body: message,
      }),
    }
  );

  const data = await response.json();
  
  if (data.error_code) {
    return res.status(500).json({ error: data.message });
  }
  
  res.status(200).json({ success: true, sid: data.sid });
}
