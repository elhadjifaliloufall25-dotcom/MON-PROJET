export const config = { api: { bodyParser: false, sizeLimit: "200mb" } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Parse cookies for access token
  const cookies = req.headers.cookie || "";
  const tokenMatch = cookies.match(/yt_access_token=([^;]+)/);
  const accessToken = tokenMatch?.[1];

  if (!accessToken) {
    return res.status(401).json({ error: "Non connecté à YouTube. Clique sur 'Connecter ma chaîne' d'abord." });
  }

  // Parse multipart form data manually
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return res.status(400).json({ error: "Content-type multipart/form-data requis" });
  }

  const boundary = contentType.split("boundary=")[1];
  if (!boundary) return res.status(400).json({ error: "Boundary manquant" });

  // Read full body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  // Parse parts
  const parts = parseMultipart(body, boundary);
  const fields = {};
  let videoBuffer = null;
  let videoMime = "video/mp4";
  let videoName = "video.mp4";

  for (const part of parts) {
    const { name, filename, contentType: ct, data } = part;
    if (filename) {
      videoBuffer = data;
      videoMime = ct || "video/mp4";
      videoName = filename;
    } else {
      fields[name] = data.toString("utf8");
    }
  }

  if (!videoBuffer) return res.status(400).json({ error: "Fichier vidéo manquant" });
  if (!fields.title) return res.status(400).json({ error: "Titre manquant" });

  const tags = fields.tags ? fields.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  const publishAt = fields.publishAt || "";
  const videoStatus = publishAt
    ? { privacyStatus: "private", publishAt }
    : { privacyStatus: "public" };

  const metadata = {
    snippet: {
      title: fields.title,
      description: fields.description || "",
      tags,
      categoryId: "22",
    },
    status: videoStatus,
  };

  try {
    // Initiate resumable upload
    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": videoMime,
          "X-Upload-Content-Length": videoBuffer.length,
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initRes.ok) {
      const err = await initRes.json();
      if (initRes.status === 401) return res.status(401).json({ error: "Token expiré. Reconnecte ta chaîne YouTube." });
      return res.status(500).json({ error: err.error?.message || "Erreur init upload YouTube" });
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) return res.status(500).json({ error: "URL upload introuvable" });

    // Upload video data
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": videoMime,
        "Content-Length": videoBuffer.length,
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return res.status(500).json({ error: err.error?.message || "Erreur upload vidéo" });
    }

    const video = await uploadRes.json();
    res.status(200).json({
      success: true,
      videoId: video.id,
      videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
      title: video.snippet?.title,
      scheduled: !!publishAt,
      publishAt: publishAt || null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

function parseMultipart(body, boundary) {
  const delimiter = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = 0;

  while (start < body.length) {
    const delimStart = indexOf(body, delimiter, start);
    if (delimStart === -1) break;
    const headerStart = delimStart + delimiter.length + 2;
    const headerEnd = indexOf(body, Buffer.from("\r\n\r\n"), headerStart);
    if (headerEnd === -1) break;

    const headerBuf = body.slice(headerStart, headerEnd).toString("utf8");
    if (headerBuf.trim() === "--") break;

    const dataStart = headerEnd + 4;
    const nextDelim = indexOf(body, delimiter, dataStart);
    const dataEnd = nextDelim === -1 ? body.length : nextDelim - 2;
    const data = body.slice(dataStart, dataEnd);

    const nameMatch = headerBuf.match(/name="([^"]+)"/);
    const filenameMatch = headerBuf.match(/filename="([^"]+)"/);
    const ctMatch = headerBuf.match(/Content-Type:\s*([^\r\n]+)/i);

    parts.push({
      name: nameMatch?.[1] || "",
      filename: filenameMatch?.[1] || null,
      contentType: ctMatch?.[1]?.trim() || null,
      data,
    });

    start = nextDelim === -1 ? body.length : nextDelim;
  }

  return parts;
}

function indexOf(buf, search, start = 0) {
  for (let i = start; i <= buf.length - search.length; i++) {
    let found = true;
    for (let j = 0; j < search.length; j++) {
      if (buf[i + j] !== search[j]) { found = false; break; }
    }
    if (found) return i;
  }
  return -1;
}
