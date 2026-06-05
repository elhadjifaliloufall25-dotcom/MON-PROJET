import { useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";

const DARK_C = {
  obsidian: "#07111F", charcoal: "rgba(255,255,255,0.06)",
  terra: "#4E7FFF", gold: "#F59E0B", gold2: "#FCD34D",
  green: "#22C55E", white: "#FFFFFF",
  border: "rgba(255,255,255,0.1)", sand: "#8899BB", gray: "#8899BB",
};
const LIGHT_C = {
  obsidian: "#F0F2FF", charcoal: "rgba(255,255,255,0.9)",
  terra: "#5A8FFA", gold: "#D97706", gold2: "#F59E0B",
  green: "#16A34A", white: "#1F1F1F",
  border: "rgba(90,143,250,0.18)", sand: "#6A6F83", gray: "#6A6F83",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`;
const G = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{overflow-x:hidden;font-family:'Poppins',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#07111F}::-webkit-scrollbar-thumb{background:#FF0000;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,0,0,0.4)}70%{box-shadow:0 0 0 8px rgba(255,0,0,0)}}
.yt-spin{width:20px;height:20px;border:2.5px solid rgba(255,255,255,0.2);border-top:2.5px solid #fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block;flex-shrink:0}
.yt-card{transition:transform .2s ease,box-shadow .2s ease}
.yt-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(255,0,0,0.12)!important}
.yt-tab-btn{transition:color .2s,border-color .2s,background .2s}
.yt-tab-btn:hover{background:rgba(255,0,0,0.06)!important}
`;

const NICHES = [
  ["Cuisine africaine 🍲","cuisine africaine et recettes africaines"],
  ["Crypto & Finance 💰","crypto monnaie et finance personnelle"],
  ["Fitness & Sport 💪","fitness musculation et perte de poids"],
  ["Tech & Gadgets 📱","technologie et gadgets tendances"],
  ["Business en ligne 🏪","business en ligne et entrepreneuriat"],
  ["Développement perso 🧠","développement personnel et motivation"],
  ["Gaming 🎮","gaming et jeux vidéo"],
  ["Mode & Beauté 💄","mode beauté et lifestyle"],
  ["Voyage ✈️","voyage et découverte de destinations"],
  ["Astuce & Hack 🔥","astuces productivité et life hacks"],
];

const STATUS_STYLE = {
  "à créer": { bg: "rgba(245,158,11,0.15)", c: "#F59E0B" },
  "en cours": { bg: "rgba(90,143,250,0.15)", c: "#5A8FFA" },
  "prêt":    { bg: "rgba(34,197,94,0.15)",  c: "#22C55E" },
  "publié":  { bg: "rgba(168,85,247,0.15)", c: "#A855F7" },
};

export default function YouTubeAutomation({ onBack, theme, onGo8D }) {
  const C = theme === "dark" ? DARK_C : LIGHT_C;
  const isDark = theme === "dark";

  const [tab, setTab] = useState("idees");
  const [toast, setToast] = useState(null);
  function showToast(m) { setToast(m); setTimeout(() => setToast(null), 3200); }
  function copyText(t) { navigator.clipboard.writeText(t).then(() => showToast("✅ Copié !")).catch(() => showToast("❌ Erreur copie")); }

  // Ideas
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // Script
  const [scriptTopic, setScriptTopic] = useState("");
  const [script, setScript] = useState("");
  const [loadingScript, setLoadingScript] = useState(false);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoData, setSeoData] = useState(null);
  const [loadingSEO, setLoadingSEO] = useState(false);

  // Queue
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem("yt_queue") || "[]"); } catch { return []; }
  });

  const inp = (extra = {}) => ({
    width: "100%", padding: "12px 15px", borderRadius: 12, outline: "none",
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.06)",
    border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "'Poppins',sans-serif",
    color: C.white, boxSizing: "border-box", transition: "border-color .25s", ...extra,
  });

  async function generateIdeas() {
    if (!niche.trim() || loadingIdeas) return;
    setLoadingIdeas(true); setIdeas([]);
    try {
      const res = await fetch("/api/youtube-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "idees", niche }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIdeas(Array.isArray(data.result) ? data.result : [{ titre: String(data.result), angle: "", potentiel_viral: 7, duree_estimee: "8-12 min" }]);
    } catch (e) { showToast("❌ " + e.message); }
    setLoadingIdeas(false);
  }

  async function generateScript() {
    if (!scriptTopic.trim() || loadingScript) return;
    setLoadingScript(true); setScript("");
    try {
      const res = await fetch("/api/youtube-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "script", topic: scriptTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScript(data.result);
    } catch (e) { showToast("❌ " + e.message); }
    setLoadingScript(false);
  }

  async function generateSEO() {
    if (!seoTitle.trim() || loadingSEO) return;
    setLoadingSEO(true); setSeoData(null);
    try {
      const res = await fetch("/api/youtube-generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "seo", title: seoTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const parsed = typeof data.result === "object" ? data.result : JSON.parse(data.result);
      setSeoData(parsed);
    } catch (e) { showToast("❌ " + e.message); }
    setLoadingSEO(false);
  }

  function addToQueue(idea) {
    const item = { id: Date.now(), titre: idea.titre || String(idea), angle: idea.angle || "", status: "à créer", date: new Date().toLocaleDateString("fr-FR") };
    const updated = [item, ...queue];
    setQueue(updated);
    localStorage.setItem("yt_queue", JSON.stringify(updated));
    showToast("✅ Ajouté à la file !");
  }

  function updateStatus(id, status) {
    const updated = queue.map(v => v.id === id ? { ...v, status } : v);
    setQueue(updated); localStorage.setItem("yt_queue", JSON.stringify(updated));
  }

  function removeFromQueue(id) {
    const updated = queue.filter(v => v.id !== id);
    setQueue(updated); localStorage.setItem("yt_queue", JSON.stringify(updated));
  }

  const TABS = [
    { id: "idees",   icon: "💡", label: "Idées" },
    { id: "script",  icon: "📝", label: "Script IA" },
    { id: "seo",     icon: "🔍", label: "SEO" },
    { id: "file",    icon: "📋", label: `File (${queue.length})` },
    { id: "upload",  icon: "⬆️", label: "Upload" },
    { id: "gain",    icon: "💰", label: "Monétisation" },
    { id: "8d",      icon: "🎧", label: "8D Audio" },
  ];

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", transition: "background .35s" }}>
      <style>{FONTS}{G}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 3000, background: isDark ? "rgba(15,15,20,0.97)" : "#fff", backdropFilter: "blur(20px)", color: C.white, borderRadius: 13, padding: "11px 18px", fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "scaleIn .3s ease both" }}>{toast}</div>
      )}

      {/* ── HEADER ── */}
      <div style={{ background: isDark ? "linear-gradient(135deg,#1a0000,#2d0000,#1a0000)" : "linear-gradient(135deg,#FF0000,#cc0000)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,0,0,0.2)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "7px 13px", color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
          <ArrowLeft size={13} /> Retour
        </button>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "#FF0000", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>▶</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>YouTube Automation</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>GÉNÈRE · OPTIMISE · PUBLIE · GAGNE</div>
        </div>
        <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#FF8080", border: "1px solid rgba(255,0,0,0.3)", animation: "pulse 2s infinite" }}>🔴 LIVE</div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,0,0,0.03)", borderBottom: `1px solid ${C.border}`, display: "flex", overflowX: "auto", padding: "0 8px", gap: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="yt-tab-btn"
            style={{ padding: "13px 16px", border: "none", borderBottom: `3px solid ${tab === t.id ? "#FF0000" : "transparent"}`, background: "transparent", color: tab === t.id ? "#FF0000" : C.sand, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 18px 60px" }}>

        {/* ═══════════ IDÉES ═══════════ */}
        {tab === "idees" && (
          <div style={{ animation: "fadeUp .4s ease both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 }}>💡 Générateur d'idées virales</h2>
            <p style={{ fontSize: 13, color: C.sand, marginBottom: 20 }}>Choisis ta niche et l'IA génère 6 idées à fort potentiel.</p>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, letterSpacing: 1, marginBottom: 10 }}>NICHES POPULAIRES</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {NICHES.map(([label, val]) => (
                  <button key={val} onClick={() => setNiche(val)}
                    style={{ padding: "6px 13px", borderRadius: 20, border: `1.5px solid ${niche === val ? "#FF0000" : C.border}`, background: niche === val ? "rgba(255,0,0,0.1)" : "transparent", color: niche === val ? "#FF6B6B" : C.sand, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .2s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ou entre ta propre niche…" style={{ ...inp(), flex: 1 }}
                onKeyDown={e => e.key === "Enter" && generateIdeas()} onFocus={e => e.target.style.borderColor = "#FF0000"} onBlur={e => e.target.style.borderColor = C.border} />
              <button onClick={generateIdeas} disabled={!niche.trim() || loadingIdeas}
                style={{ padding: "12px 22px", borderRadius: 12, border: "none", background: niche.trim() && !loadingIdeas ? "#FF0000" : "rgba(255,0,0,0.25)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: niche.trim() && !loadingIdeas ? "pointer" : "default", fontFamily: "'Poppins',sans-serif", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {loadingIdeas ? <><span className="yt-spin" /> Génération…</> : "✨ Générer"}
              </button>
            </div>

            {ideas.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ideas.map((idea, i) => (
                  <div key={i} className="yt-card" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderRadius: 16, padding: 18, border: `1px solid rgba(255,0,0,0.12)`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#FF6B6B", flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 5 }}>{idea.titre || String(idea)}</div>
                      {idea.angle && <div style={{ fontSize: 12, color: C.sand, marginBottom: 8, lineHeight: 1.5 }}>🎯 {idea.angle}</div>}
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {idea.potentiel_viral && <span style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(245,158,11,0.3)" }}>⚡ Viral {idea.potentiel_viral}/10</span>}
                        {idea.duree_estimee && <span style={{ background: "rgba(90,143,250,0.15)", color: "#5A8FFA", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(90,143,250,0.3)" }}>🕐 {idea.duree_estimee}</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { setScriptTopic(idea.titre || String(idea)); setTab("script"); }}
                        style={{ padding: "7px 14px", borderRadius: 9, border: "none", background: "#FF0000", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                        📝 Script →
                      </button>
                      <button onClick={() => { setSeoTitle(idea.titre || String(idea)); setTab("seo"); }}
                        style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.sand, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                        🔍 SEO →
                      </button>
                      <button onClick={() => addToQueue(idea)}
                        style={{ padding: "7px 14px", borderRadius: 9, border: `1px solid rgba(34,197,94,0.3)`, background: "rgba(34,197,94,0.08)", color: "#22C55E", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                        + File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loadingIdeas && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.sand }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>💡</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>Trouve ta niche gagnante</div>
                <div style={{ fontSize: 12 }}>Sélectionne une niche ou entre la tienne et génère des idées virales.</div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SCRIPT IA ═══════════ */}
        {tab === "script" && (
          <div style={{ animation: "fadeUp .4s ease both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 }}>📝 Générateur de scripts IA</h2>
            <p style={{ fontSize: 13, color: C.sand, marginBottom: 20 }}>Un script professionnel complet — hook, développement, call to action.</p>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={scriptTopic} onChange={e => setScriptTopic(e.target.value)} placeholder="Sujet de ta vidéo (ex: Comment gagner de l'argent avec YouTube…)"
                style={{ ...inp(), flex: 1 }} onKeyDown={e => e.key === "Enter" && generateScript()}
                onFocus={e => e.target.style.borderColor = "#FF0000"} onBlur={e => e.target.style.borderColor = C.border} />
              <button onClick={generateScript} disabled={!scriptTopic.trim() || loadingScript}
                style={{ padding: "12px 22px", borderRadius: 12, border: "none", background: scriptTopic.trim() && !loadingScript ? "#FF0000" : "rgba(255,0,0,0.25)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: scriptTopic.trim() && !loadingScript ? "pointer" : "default", fontFamily: "'Poppins',sans-serif", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {loadingScript ? <><span className="yt-spin" /> Écriture…</> : "✍️ Écrire"}
              </button>
            </div>

            {script ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, letterSpacing: 1 }}>SCRIPT GÉNÉRÉ · {script.split(" ").length} mots</div>
                  <button onClick={() => copyText(script)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", color: C.terra, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>📋 Copier</button>
                </div>
                <div style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", borderRadius: 16, padding: 20, border: `1px solid ${C.border}`, whiteSpace: "pre-wrap", fontSize: 13, color: C.white, lineHeight: 1.85, maxHeight: 480, overflowY: "auto" }}>{script}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={() => { setSeoTitle(scriptTopic); setTab("seo"); }}
                    style={{ padding: "10px 20px", borderRadius: 11, border: "none", background: "#FF0000", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                    🔍 Générer SEO →
                  </button>
                  <button onClick={() => copyText(script)}
                    style={{ padding: "10px 20px", borderRadius: 11, border: `1px solid ${C.border}`, background: "transparent", color: C.sand, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                    📋 Tout copier
                  </button>
                </div>
              </div>
            ) : !loadingScript && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.sand }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📝</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>Script professionnel en 1 clic</div>
                <div style={{ fontSize: 12 }}>Hook accrocheur, 3 points clés, call to action — tout inclus.</div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ SEO ═══════════ */}
        {tab === "seo" && (
          <div style={{ animation: "fadeUp .4s ease both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 }}>🔍 Optimisation SEO YouTube</h2>
            <p style={{ fontSize: 13, color: C.sand, marginBottom: 20 }}>Titre, description et tags optimisés pour ranker sur YouTube.</p>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="Titre ou sujet de ta vidéo…"
                style={{ ...inp(), flex: 1 }} onKeyDown={e => e.key === "Enter" && generateSEO()}
                onFocus={e => e.target.style.borderColor = "#FF0000"} onBlur={e => e.target.style.borderColor = C.border} />
              <button onClick={generateSEO} disabled={!seoTitle.trim() || loadingSEO}
                style={{ padding: "12px 22px", borderRadius: 12, border: "none", background: seoTitle.trim() && !loadingSEO ? "#FF0000" : "rgba(255,0,0,0.25)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: seoTitle.trim() && !loadingSEO ? "pointer" : "default", fontFamily: "'Poppins',sans-serif", flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {loadingSEO ? <><span className="yt-spin" /> Optimisation…</> : "🔍 Optimiser"}
              </button>
            </div>

            {seoData ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { key: "titre_seo", label: "TITRE SEO OPTIMISÉ", render: (v) => <><div style={{ fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.5 }}>{v}</div><div style={{ fontSize: 10, color: C.sand, marginTop: 5 }}>{v.length}/70 caractères</div></> },
                  { key: "description", label: "DESCRIPTION", render: (v) => <div style={{ fontSize: 12, color: C.sand, lineHeight: 1.75, whiteSpace: "pre-wrap", maxHeight: 160, overflowY: "auto" }}>{v}</div> },
                ].map(({ key, label, render }) => seoData[key] && (
                  <div key={key} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", borderRadius: 16, padding: 18, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, letterSpacing: 1 }}>{label}</div>
                      <button onClick={() => copyText(seoData[key])} style={{ background: "none", border: "none", color: C.terra, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>📋 Copier</button>
                    </div>
                    {render(seoData[key])}
                  </div>
                ))}

                {seoData.tags && (
                  <div style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", borderRadius: 16, padding: 18, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, letterSpacing: 1 }}>TAGS ({seoData.tags.length})</div>
                      <button onClick={() => copyText(seoData.tags.join(", "))} style={{ background: "none", border: "none", color: C.terra, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>📋 Copier tout</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {seoData.tags.map((tag, i) => (
                        <span key={i} onClick={() => copyText(tag)} style={{ background: "rgba(255,0,0,0.1)", color: "#FF6B6B", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,0,0,0.2)", cursor: "pointer" }}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {seoData.miniature_idee && (
                  <div style={{ background: "rgba(245,158,11,0.07)", borderRadius: 16, padding: 18, border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", letterSpacing: 1, marginBottom: 8 }}>IDÉE DE MINIATURE 🎨</div>
                    <div style={{ fontSize: 13, color: C.white, lineHeight: 1.65 }}>{seoData.miniature_idee}</div>
                  </div>
                )}
              </div>
            ) : !loadingSEO && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.sand }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>SEO YouTube automatique</div>
                <div style={{ fontSize: 12 }}>Maximise tes vues avec un titre, une description et des tags parfaits.</div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ FILE ═══════════ */}
        {tab === "file" && (
          <div style={{ animation: "fadeUp .4s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 }}>📋 File de production</h2>
                <p style={{ fontSize: 13, color: C.sand }}>Suis l'avancement de chaque vidéo.</p>
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {Object.entries(STATUS_STYLE).map(([s, st]) => (
                  <div key={s} style={{ background: st.bg, color: st.c, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, border: `1px solid ${st.c}44` }}>
                    {queue.filter(v => v.status === s).length} {s}
                  </div>
                ))}
              </div>
            </div>

            {queue.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: C.sand }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📋</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 6 }}>File vide</div>
                <div style={{ fontSize: 12, marginBottom: 22 }}>Génère des idées et ajoute-les ici pour suivre ta production.</div>
                <button onClick={() => setTab("idees")} style={{ padding: "10px 22px", borderRadius: 11, border: "none", background: "#FF0000", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>💡 Générer des idées</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {queue.map(video => (
                  <div key={video.id} className="yt-card" style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎬</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>{video.titre}</div>
                      {video.angle && <div style={{ fontSize: 11, color: C.sand, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.angle}</div>}
                      <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>Ajouté le {video.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: 7, alignItems: "center", flexShrink: 0 }}>
                      <select value={video.status} onChange={e => updateStatus(video.id, e.target.value)}
                        style={{ padding: "5px 9px", borderRadius: 9, border: `1px solid ${STATUS_STYLE[video.status]?.c}44`, background: STATUS_STYLE[video.status]?.bg, color: STATUS_STYLE[video.status]?.c, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", outline: "none" }}>
                        {Object.keys(STATUS_STYLE).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => removeFromQueue(video.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "5px 9px", color: "#EF4444", fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ UPLOAD ═══════════ */}
        {tab === "upload" && (
          <div style={{ animation: "fadeUp .4s ease both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 }}>⬆️ Upload sur YouTube</h2>
            <p style={{ fontSize: 13, color: C.sand, marginBottom: 20 }}>Connecte ta chaîne et uploade directement depuis l'app.</p>

            <div style={{ background: "linear-gradient(135deg,rgba(255,0,0,0.07),rgba(255,0,0,0.02))", borderRadius: 18, padding: 22, border: "1px solid rgba(255,0,0,0.18)", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "#FF0000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>▶</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.white }}>Connexion YouTube</div>
                  <div style={{ fontSize: 12, color: C.sand }}>Requiert YouTube Data API v3</div>
                </div>
              </div>
              <div style={{ background: "rgba(245,158,11,0.07)", borderRadius: 12, padding: 14, border: "1px solid rgba(245,158,11,0.18)", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 8 }}>📋 Configuration (1 fois)</div>
                {["Ouvre Google Cloud Console → Nouvelle API → Active YouTube Data API v3","Crée des credentials OAuth 2.0 (type : application Web)","Ajoute les variables d'env sur Vercel : YOUTUBE_CLIENT_ID + YOUTUBE_CLIENT_SECRET"].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 12, color: C.sand, lineHeight: 1.5 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(245,158,11,0.2)", color: "#F59E0B", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              <button onClick={() => window.open("/api/youtube-oauth", "_blank")} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#FF0000", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                🔗 Connecter ma chaîne YouTube
              </button>
            </div>

            <UploadForm C={C} isDark={isDark} showToast={showToast} />
          </div>
        )}

        {/* ═══════════ 8D ═══════════ */}
        {tab === "8d" && (
          <div style={{ animation: "fadeUp .4s ease both", textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>🎧</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 10 }}>Convertisseur 8D Audio</h2>
            <p style={{ fontSize: 13, color: C.sand, marginBottom: 28, lineHeight: 1.7 }}>
              Transforme tes xassida en audio 8D immersif.<br/>
              Effet de rotation 3D · Réverbération · Export WAV haute qualité.
            </p>
            <button onClick={onGo8D}
              style={{ padding: "16px 36px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#A855F7,#7c3aed)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 8px 32px rgba(168,85,247,0.4)", display: "inline-flex", alignItems: "center", gap: 10 }}>
              🎧 Ouvrir le studio 8D →
            </button>
          </div>
        )}

        {/* ═══════════ MONÉTISATION ═══════════ */}
        {tab === "gain" && (
          <div style={{ animation: "fadeUp .4s ease both" }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 4 }}>💰 Guide Monétisation YouTube</h2>
            <p style={{ fontSize: 13, color: C.sand, marginBottom: 22 }}>Tout ce qu'il faut savoir pour gagner de l'argent avec ta chaîne.</p>

            {/* YPP Requirements */}
            <div style={{ background: "linear-gradient(135deg,rgba(255,0,0,0.08),rgba(255,0,0,0.03))", borderRadius: 18, padding: 22, border: "1px solid rgba(255,0,0,0.18)", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B6B", letterSpacing: 1, marginBottom: 14 }}>🎯 PROGRAMME PARTENAIRE YOUTUBE (YPP)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Abonnés requis", val: "1 000", icon: "👥", c: "#5A8FFA" },
                  { label: "Heures de visionnage", val: "4 000 h", icon: "⏱️", c: "#F59E0B" },
                  { label: "Ou Shorts vues", val: "10M Shorts", icon: "📱", c: "#A855F7" },
                  { label: "Délai moyen", val: "3-12 mois", icon: "📅", c: "#22C55E" },
                ].map((s, i) => (
                  <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)", borderRadius: 14, padding: "14px 16px", border: `1px solid ${s.c}22` }}>
                    <div style={{ fontSize: 18, marginBottom: 5 }}>{s.icon}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: C.sand, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue sources */}
            <div style={{ fontSize: 11, fontWeight: 700, color: C.sand, letterSpacing: 1, marginBottom: 12 }}>SOURCES DE REVENUS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                { icon: "📺", title: "Publicités AdSense", desc: "1-5 $ / 1000 vues selon la niche. Finance et business payent 5-10x plus.", c: "#FF0000" },
                { icon: "🤝", title: "Sponsoring de marques", desc: "500 à 10 000 $ par vidéo dès 10K abonnés si bonne niche.", c: "#F59E0B" },
                { icon: "🛒", title: "Affiliation", desc: "Commissions sur les produits que tu recommandes (Amazon, ClickBank…).", c: "#22C55E" },
                { icon: "🎁", title: "Super Chats & Memberships", desc: "Tes fans paient directement via YouTube pour te soutenir.", c: "#A855F7" },
                { icon: "📦", title: "Tes propres produits", desc: "Cours en ligne, merch, formation — la meilleure marge.", c: "#5A8FFA" },
              ].map((r, i) => (
                <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", borderRadius: 14, padding: "15px 18px", border: `1px solid ${r.c}18`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: `${r.c}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: C.sand, lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div style={{ background: "rgba(34,197,94,0.06)", borderRadius: 16, padding: 20, border: "1px solid rgba(34,197,94,0.18)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", letterSpacing: 1, marginBottom: 12 }}>🚀 STRATÉGIE AUTOMATION GAGNANTE</div>
              {["Poste 3-4 vidéos/semaine minimum (régularité = algorithme favorisé)","Vise des niches avec CPM élevé : finance, immobilier, business, tech","Utilise ce générateur pour créer du contenu en série (même niche)","Optimise chaque vidéo avec les outils SEO ci-dessus","Repurpose : 1 vidéo longue → 5 Shorts → plus de visibilité"].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 12, color: C.sand, lineHeight: 1.5 }}>
                  <span style={{ color: "#22C55E", fontWeight: 800, flexShrink: 0 }}>✓</span>{tip}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function UploadForm({ C, isDark, showToast }) {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [publishTime, setPublishTime] = useState("08:00");
  const [lastResult, setLastResult] = useState(null);
  const fileRef = useRef(null);

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const inp = (extra = {}) => ({
    width: "100%", padding: "12px 15px", borderRadius: 11, outline: "none",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(90,143,250,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", fontSize: 13,
    fontFamily: "'Poppins',sans-serif", color: isDark ? "#fff" : "#1F1F1F",
    boxSizing: "border-box", marginBottom: 10, transition: "border-color .25s", ...extra,
  });

  function isValid() {
    if (!videoFile || !title || uploading) return false;
    if (scheduled && !publishDate) return false;
    return true;
  }

  async function handleUpload() {
    if (!isValid()) return;
    setUploading(true);
    setLastResult(null);
    try {
      let publishAt = "";
      if (scheduled && publishDate) {
        // Convert local date+time to UTC ISO string
        publishAt = new Date(`${publishDate}T${publishTime || "08:00"}:00`).toISOString();
      }

      const form = new FormData();
      form.append("video", videoFile);
      form.append("title", title);
      form.append("description", description);
      form.append("tags", tags);
      if (publishAt) form.append("publishAt", publishAt);

      const res = await fetch("/api/youtube-upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur upload");

      setLastResult({ url: data.videoUrl, scheduled: !!publishAt, publishAt });
      showToast(publishAt ? "📅 Vidéo planifiée !" : "🎉 Vidéo publiée !");
      setVideoFile(null); setTitle(""); setDescription(""); setTags(""); setPublishDate("");
    } catch (e) {
      showToast("❌ " + e.message);
    }
    setUploading(false);
  }

  const borderColor = "rgba(255,255,255,0.1)";

  return (
    <div style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.9)", borderRadius: 18, padding: 22, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(90,143,250,0.15)"}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? "#8899BB" : "#6A6F83", letterSpacing: 1, marginBottom: 16 }}>UPLOADER UNE VIDÉO</div>
      <input ref={fileRef} type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ display: "none" }} />

      {videoFile ? (
        <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: 12, padding: 14, marginBottom: 12, border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎬</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#22C55E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{videoFile.name}</div>
            <div style={{ fontSize: 11, color: isDark ? "#8899BB" : "#6A6F83" }}>{(videoFile.size / 1024 / 1024).toFixed(1)} MB</div>
          </div>
          <button onClick={() => setVideoFile(null)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      ) : (
        <div onClick={() => fileRef.current?.click()}
          style={{ border: "2px dashed rgba(255,0,0,0.22)", borderRadius: 14, padding: "28px 20px", textAlign: "center", cursor: "pointer", marginBottom: 12, background: "rgba(255,0,0,0.02)", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#FF0000"; e.currentTarget.style.background = "rgba(255,0,0,0.05)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,0,0,0.22)"; e.currentTarget.style.background = "rgba(255,0,0,0.02)"; }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#FF6B6B", marginBottom: 4 }}>Sélectionner une vidéo</div>
          <div style={{ fontSize: 11, color: isDark ? "#8899BB" : "#6A6F83" }}>MP4, MOV, AVI · jusqu'à 128 GB</div>
        </div>
      )}

      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la vidéo *" style={inp()} onFocus={e => e.target.style.borderColor = "#FF0000"} onBlur={e => e.target.style.borderColor = borderColor} />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description YouTube (mots-clés, timestamps…)" style={inp({ minHeight: 90, resize: "vertical" })} onFocus={e => e.target.style.borderColor = "#FF0000"} onBlur={e => e.target.style.borderColor = borderColor} />
      <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags séparés par des virgules" style={inp({ marginBottom: 14 })} onFocus={e => e.target.style.borderColor = "#FF0000"} onBlur={e => e.target.style.borderColor = borderColor} />

      {/* SCHEDULE TOGGLE */}
      <div style={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(90,143,250,0.04)", borderRadius: 14, padding: 14, border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(90,143,250,0.12)"}`, marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: isDark ? "#8899BB" : "#6A6F83", letterSpacing: 1, marginBottom: 12 }}>MODE DE PUBLICATION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: scheduled ? 14 : 0 }}>
          <button onClick={() => setScheduled(false)}
            style={{ padding: "11px 10px", borderRadius: 11, border: `2px solid ${!scheduled ? "#FF0000" : borderColor}`, background: !scheduled ? "rgba(255,0,0,0.1)" : "transparent", cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .2s" }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>🔴</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: !scheduled ? "#FF6B6B" : (isDark ? "#8899BB" : "#6A6F83") }}>Publier maintenant</div>
            <div style={{ fontSize: 10, color: isDark ? "#8899BB" : "#6A6F83", marginTop: 2 }}>Visible immédiatement</div>
          </button>
          <button onClick={() => setScheduled(true)}
            style={{ padding: "11px 10px", borderRadius: 11, border: `2px solid ${scheduled ? "#F59E0B" : borderColor}`, background: scheduled ? "rgba(245,158,11,0.1)" : "transparent", cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .2s" }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>📅</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: scheduled ? "#F59E0B" : (isDark ? "#8899BB" : "#6A6F83") }}>Planifier</div>
            <div style={{ fontSize: 10, color: isDark ? "#8899BB" : "#6A6F83", marginTop: 2 }}>Choisir date & heure</div>
          </button>
        </div>

        {scheduled && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, animation: "scaleIn .2s ease both" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", letterSpacing: 1, marginBottom: 6 }}>📅 DATE</div>
              <input
                type="date"
                value={publishDate}
                min={minDate}
                onChange={e => setPublishDate(e.target.value)}
                style={{ ...inp({ marginBottom: 0, accentColor: "#F59E0B" }), colorScheme: isDark ? "dark" : "light" }}
                onFocus={e => e.target.style.borderColor = "#F59E0B"}
                onBlur={e => e.target.style.borderColor = borderColor}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", letterSpacing: 1, marginBottom: 6 }}>🕐 HEURE</div>
              <input
                type="time"
                value={publishTime}
                onChange={e => setPublishTime(e.target.value)}
                style={{ ...inp({ marginBottom: 0, accentColor: "#F59E0B" }), colorScheme: isDark ? "dark" : "light" }}
                onFocus={e => e.target.style.borderColor = "#F59E0B"}
                onBlur={e => e.target.style.borderColor = borderColor}
              />
            </div>
            {publishDate && (
              <div style={{ gridColumn: "span 2", background: "rgba(245,158,11,0.08)", borderRadius: 9, padding: "9px 12px", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>
                📅 Publication prévue : {new Date(`${publishDate}T${publishTime || "08:00"}:00`).toLocaleString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={handleUpload} disabled={!isValid()}
        style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: isValid() ? (scheduled ? "#F59E0B" : "#FF0000") : "rgba(255,0,0,0.2)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: isValid() ? "pointer" : "default", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
        {uploading
          ? <><span className="yt-spin" /> {scheduled ? "Planification…" : "Upload en cours…"}</>
          : scheduled ? "📅 Planifier la publication" : "⬆️ Publier maintenant sur YouTube"}
      </button>

      {lastResult && (
        <div style={{ marginTop: 14, background: "rgba(34,197,94,0.08)", borderRadius: 12, padding: 14, border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#22C55E", marginBottom: 6 }}>
            {lastResult.scheduled ? "📅 Vidéo planifiée avec succès !" : "🎉 Vidéo publiée avec succès !"}
          </div>
          {lastResult.scheduled && (
            <div style={{ fontSize: 11, color: isDark ? "#8899BB" : "#6A6F83", marginBottom: 8 }}>
              Elle sera visible le {new Date(lastResult.publishAt).toLocaleString("fr-FR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
          {lastResult.url && (
            <a href={lastResult.url} target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: "#FF6B6B", fontWeight: 600, wordBreak: "break-all" }}>
              🔗 {lastResult.url}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
