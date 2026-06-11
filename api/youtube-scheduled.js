async function refreshToken(rt, res) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: rt,
    }),
  });
  const data = await r.json();
  if (!r.ok || !data.access_token) return null;
  res.setHeader("Set-Cookie", `yt_access_token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const cookies = req.headers.cookie || "";
  const tokenMatch = cookies.match(/yt_access_token=([^;]+)/);
  const refreshMatch = cookies.match(/yt_refresh_token=([^;]+)/);
  let accessToken = tokenMatch?.[1];
  const refreshTokenVal = refreshMatch?.[1];

  if (!accessToken && !refreshTokenVal)
    return res.status(401).json({ error: "Non connecté" });
  if (!accessToken) {
    accessToken = await refreshToken(refreshTokenVal, res);
    if (!accessToken) return res.status(401).json({ error: "Session expirée" });
  }

  try {
    // videos.list with mine=true lists all my videos including private/scheduled
    const r = await fetch(
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,status&mine=true&maxResults=20",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!r.ok) {
      const err = await r.json();
      if (r.status === 401) return res.status(401).json({ error: "Token expiré — reconnecte ta chaîne" });
      return res.status(500).json({ error: err.error?.message || "Erreur API YouTube" });
    }

    const data = await r.json();
    const all = data.items || [];
    const scheduled = all.filter(v => v.status?.publishAt);
    const privateOnly = all.filter(v => v.status?.privacyStatus === "private" && !v.status?.publishAt);

    const fmt = v => ({
      id: v.id,
      title: v.snippet?.title,
      thumbnail: v.snippet?.thumbnails?.medium?.url,
      publishAt: v.status?.publishAt || null,
    });

    res.status(200).json({ scheduled: scheduled.map(fmt), privateOnly: privateOnly.map(fmt) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
