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

  if (!accessToken && refreshTokenVal) {
    accessToken = await refreshToken(refreshTokenVal, res);
    if (!accessToken) return res.status(401).json({ error: "Session expirée" });
  }

  try {
    // List private videos (scheduled videos are private with publishAt set)
    const r = await fetch(
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,status&myRating=none&mine=true&privacyStatus=private&maxResults=20",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // The above won't work with mine=true on videos endpoint, use search
    const searchRes = await fetch(
      "https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&privacyStatus=private&maxResults=20",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!searchRes.ok) {
      const err = await searchRes.json();
      if (searchRes.status === 401) return res.status(401).json({ error: "Token expiré" });
      return res.status(500).json({ error: err.error?.message || "Erreur API YouTube" });
    }

    const searchData = await searchRes.json();
    const videoIds = (searchData.items || []).map(v => v.id?.videoId).filter(Boolean);

    if (videoIds.length === 0) return res.status(200).json({ videos: [] });

    // Get full status info including publishAt
    const detailRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoIds.join(",")}&maxResults=20`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!detailRes.ok) {
      const err = await detailRes.json();
      return res.status(500).json({ error: err.error?.message || "Erreur récupération détails" });
    }

    const detailData = await detailRes.json();
    const videos = (detailData.items || []).map(v => ({
      id: v.id,
      title: v.snippet?.title,
      thumbnail: v.snippet?.thumbnails?.medium?.url || v.snippet?.thumbnails?.default?.url,
      publishedAt: v.snippet?.publishedAt,
      privacyStatus: v.status?.privacyStatus,
      uploadStatus: v.status?.uploadStatus,
      publishAt: v.status?.publishAt || null,
    }));

    // Separate scheduled (has publishAt) from just private
    const scheduled = videos.filter(v => v.publishAt);
    const privateOnly = videos.filter(v => !v.publishAt);

    res.status(200).json({ scheduled, privateOnly });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
