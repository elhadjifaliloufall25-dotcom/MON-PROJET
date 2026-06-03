export default function handler(req, res) {
  const clientId = process.env.YOUTUBE_CLIENT_ID;

  if (!clientId) {
    return res.status(500).send(`
      <html><body style="font-family:sans-serif;padding:40px;background:#07111F;color:#fff">
        <h2 style="color:#FF6B6B">⚠️ YOUTUBE_CLIENT_ID manquant</h2>
        <p>Configure ces variables dans les paramètres Vercel :</p>
        <ul style="margin:16px 0;line-height:2">
          <li><code style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px">YOUTUBE_CLIENT_ID</code></li>
          <li><code style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:4px">YOUTUBE_CLIENT_SECRET</code></li>
        </ul>
        <p style="color:#8899BB">Obtiens-les sur <a href="https://console.cloud.google.com" style="color:#5A8FFA">console.cloud.google.com</a> → API YouTube Data v3 → Credentials OAuth 2.0</p>
      </body></html>
    `);
  }

  const host = req.headers.host || "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/youtube-callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
