const COUNTRY_NAMES = {
  SN: "Sénégal", FR: "France", US: "États-Unis", IT: "Italie",
  ES: "Espagne", CI: "Côte d'Ivoire", ML: "Mali", MR: "Mauritanie",
  GM: "Gambie", GN: "Guinée", GB: "Royaume-Uni", DE: "Allemagne",
  BE: "Belgique", MA: "Maroc", NE: "Niger", BF: "Burkina Faso",
  GW: "Guinée-Bissau", NG: "Nigeria", CM: "Cameroun", CA: "Canada",
  SA: "Arabie Saoudite", AE: "Émirats Arabes Unis", TN: "Tunisie",
  DZ: "Algérie", CH: "Suisse", NL: "Pays-Bas", PT: "Portugal",
};

export default async function handler(req, res) {
  const cookies = req.headers.cookie || "";
  const tokenMatch = cookies.match(/yt_access_token=([^;]+)/);
  const accessToken = tokenMatch?.[1];

  if (!accessToken) return res.status(401).json({ error: "Non connecté à YouTube" });

  const h = { Authorization: `Bearer ${accessToken}` };

  try {
    // Channel info + contentDetails (uploads playlist ID)
    const chanRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&mine=true",
      { headers: h }
    );
    if (!chanRes.ok) return res.status(401).json({ error: "Token invalide ou expiré. Reconnecte ta chaîne." });

    const chanData = await chanRes.json();
    if (!chanData.items?.length) return res.status(404).json({ error: "Chaîne YouTube introuvable." });

    const chan = chanData.items[0];
    const uploadsPlaylistId = chan.contentDetails?.relatedPlaylists?.uploads;

    const endDate = new Date().toISOString().split("T")[0];
    const start28 = new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0];

    // Parallel: analytics + countries + videos list
    const [analyticsRes, countriesRes, videosListRes] = await Promise.all([
      fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${start28}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,subscribersGained&dimensions=day&sort=day`,
        { headers: h }
      ),
      fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${start28}&endDate=${endDate}&metrics=views&dimensions=country&sort=-views&maxResults=10`,
        { headers: h }
      ),
      uploadsPlaylistId
        ? fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50`,
            { headers: h }
          )
        : Promise.resolve(null),
    ]);

    const analyticsData = await analyticsRes.json();
    const countriesData = await countriesRes.json();
    const videosListData = videosListRes ? await videosListRes.json() : null;

    // Aggregate 28-day metrics
    const rows = analyticsData.rows || [];
    let totalViews28 = 0, totalWatchMin = 0, totalNewSubs = 0;
    const viewsByDay = [];

    for (const [day, views = 0, watchMin = 0, subs = 0] of rows) {
      totalViews28 += views;
      totalWatchMin += watchMin;
      totalNewSubs += subs;
      viewsByDay.push({ day, views });
    }

    // Countries
    const countries = (countriesData.rows || []).map(([code, views]) => ({
      code,
      name: COUNTRY_NAMES[code] || code,
      views,
    }));

    // Top videos with statistics
    let topVideos = [];
    if (videosListData?.items?.length) {
      const videoIds = videosListData.items
        .map(v => v.snippet?.resourceId?.videoId)
        .filter(Boolean)
        .join(",");

      if (videoIds) {
        const statsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
          { headers: h }
        );
        const statsData = await statsRes.json();
        topVideos = (statsData.items || [])
          .map(v => ({
            id: v.id,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails?.medium?.url || "",
            views: parseInt(v.statistics.viewCount || 0),
            likes: parseInt(v.statistics.likeCount || 0),
            comments: parseInt(v.statistics.commentCount || 0),
            publishedAt: v.snippet.publishedAt,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 8);
      }
    }

    res.status(200).json({
      channel: {
        name: chan.snippet.title,
        subscribers: parseInt(chan.statistics.subscriberCount || 0),
        totalViews: parseInt(chan.statistics.viewCount || 0),
        videoCount: parseInt(chan.statistics.videoCount || 0),
        thumbnail: chan.snippet.thumbnails?.default?.url || "",
        hiddenSubscriberCount: chan.statistics.hiddenSubscriberCount || false,
      },
      period28d: {
        views: totalViews28,
        watchTimeHours: Math.round(totalWatchMin / 60),
        newSubscribers: totalNewSubs,
        viewsByDay,
      },
      countries,
      topVideos,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
