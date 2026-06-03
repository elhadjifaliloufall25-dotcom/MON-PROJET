export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect("/?yt_error=" + encodeURIComponent(error));
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const host = req.headers.host || "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/youtube-callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.redirect("/?yt_error=" + encodeURIComponent(tokens.error_description || "Token error"));
    }

    const cookies = [
      `yt_access_token=${tokens.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
    ];
    if (tokens.refresh_token) {
      cookies.push(`yt_refresh_token=${tokens.refresh_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
    }
    res.setHeader("Set-Cookie", cookies);
    res.redirect("/?yt_connected=1");
  } catch (e) {
    res.redirect("/?yt_error=" + encodeURIComponent(e.message));
  }
}
