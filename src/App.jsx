import { useState, useEffect, useRef, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── SUPABASE ─────────────────────────────────────────── */
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPA_URL, SUPA_KEY);

async function supaFetch(path, options = {}) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": `Bearer ${SUPA_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function uploadImage(file, phone) {
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${phone}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("produits")
    .upload(path, file, { contentType: file.type || "image/jpeg", upsert: true });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("produits").getPublicUrl(path);
  return data.publicUrl;
}

const db = {
  getProduits: (phone) => supaFetch(`produits?marchand_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc`),
  addProduit: (p) => supaFetch("produits", { method: "POST", body: JSON.stringify(p) }),
  deleteProduit: (id) => supaFetch(`produits?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" }),
  getCommandes: (phone) => supaFetch(`commandes?marchand_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc`),
  addCommande: (c) => supaFetch("commandes", { method: "POST", body: JSON.stringify(c) }),
  updateCommande: (id, u) => supaFetch(`commandes?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(u), prefer: "return=minimal" }),
};

/* ── PALETTES ─────────────────────────────────────────── */
const DARK_C = {
  obsidian: "#1F1F1F", charcoal: "#252525", ember: "#2E2E2E",
  terra: "#5A8FFA", terr2: "#7AA5FC", secondary: "#2C3B8F",
  gold: "#F59E0B", gold2: "#FCD34D",
  green: "#22C55E", white: "#FFFFFF",
  border: "rgba(255,255,255,0.08)", delivery: "#5A8FFA",
  sand: "#A4B1CF", gray: "#A4B1CF",
};
const LIGHT_C = {
  obsidian: "#F0F2FF", charcoal: "rgba(255,255,255,0.9)", ember: "#FFFFFF",
  terra: "#5A8FFA", terr2: "#7AA5FC", secondary: "#2C3B8F",
  gold: "#D97706", gold2: "#F59E0B",
  green: "#16A34A", white: "#1F1F1F",
  border: "rgba(90,143,250,0.18)", delivery: "#2C3B8F",
  sand: "#6A6F83", gray: "#6A6F83",
};

/* ── THEME CONTEXT ────────────────────────────────────── */
const ThemeCtx = createContext({ C: DARK_C, theme: "dark", toggle: () => {} });
function useTheme() { return useContext(ThemeCtx); }

/* ── FONTS & GLOBAL CSS ───────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`;

const G = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{overflow-x:hidden;font-family:'Poppins',sans-serif}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#1F1F1F}
::-webkit-scrollbar-thumb{background:#5A8FFA;border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(90,143,250,0.55)}70%{box-shadow:0 0 0 10px rgba(90,143,250,0)}}
@keyframes pageIn{from{opacity:0;transform:translateX(40px) scale(0.98)}to{opacity:1;transform:translateX(0) scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes gradpan{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
.reveal.on{opacity:1;transform:translateY(0)}
.mag{transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease}
.mag:hover{transform:translateY(-2px) scale(1.02)}
.mag:active{transform:scale(0.98)}
.ch{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.ch:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(90,143,250,0.2)!important;border-color:rgba(90,143,250,0.4)!important}
.gs{background:linear-gradient(90deg,#5A8FFA,#7AA5FC,#A4C4FF,#5A8FFA);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
.page{animation:pageIn .45s cubic-bezier(.34,.8,.64,1) both}
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:float 6s ease-in-out infinite}
.spinner{width:32px;height:32px;border:3px solid rgba(90,143,250,0.15);border-top:3px solid #5A8FFA;border-radius:50%;animation:spin .8s linear infinite}
.img-upload-zone{border:2px dashed rgba(90,143,250,0.25);border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;background:rgba(90,143,250,0.04)}
.img-upload-zone:hover{border-color:#5A8FFA;background:rgba(90,143,250,0.1)}
`;

/* ── HOOKS ────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
      { threshold: 0.08 }
    );
    els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 0.1}s`; obs.observe(el); });
    return () => obs.disconnect();
  });
}

/* ── COMPOSANTS DE BASE ───────────────────────────────── */
function AnimNum({ n, suf = "" }) {
  const [v, setV] = useState(0); const r = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const num = parseInt(String(n).replace(/\D/g, '')) || 0;
      let cur = 0;
      const t = setInterval(() => { cur += num / 60; if (cur >= num) { setV(num); clearInterval(t); } else setV(Math.floor(cur)); }, 25);
      obs.disconnect();
    }, { threshold: 0.5 });
    if (r.current) obs.observe(r.current);
    return () => obs.disconnect();
  }, [n]);
  return <span ref={r}>{v.toLocaleString()}{suf}</span>;
}

function Badge({ status }) {
  const m = {
    nouveau: { bg: "rgba(245,158,11,0.15)", c: "#F59E0B", l: "Nouveau" },
    "en cours": { bg: "rgba(90,143,250,0.15)", c: "#5A8FFA", l: "En cours" },
    livré: { bg: "rgba(34,197,94,0.15)", c: "#22C55E", l: "Livré" },
    assigné: { bg: "rgba(168,85,247,0.15)", c: "#A855F7", l: "Assigné" }
  };
  const s = m[status] || m.nouveau;
  return <span style={{ background: s.bg, color: s.c, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, fontFamily: "'Poppins',sans-serif", border: `1px solid ${s.c}33` }}>{s.l}</span>;
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const { C } = useTheme();
  const base = { border: "none", cursor: disabled ? "default" : "pointer", fontFamily: "'Poppins',sans-serif", fontWeight: 600, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.38 : 1, transition: "all 0.2s" };
  const v = {
    primary: { background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", color: "#fff", padding: "13px 28px", fontSize: 14, boxShadow: "0 4px 20px rgba(90,143,250,0.35)" },
    gold: { background: `linear-gradient(135deg,${C.gold},${C.gold2})`, color: "#1F1F1F", padding: "13px 28px", fontSize: 14 },
    ghost: { background: "rgba(90,143,250,0.08)", color: C.terra, padding: "12px 24px", fontSize: 14, border: "1px solid rgba(90,143,250,0.25)" },
    blue: { background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", color: "#fff", padding: "13px 28px", fontSize: 14 },
  };
  return <button onClick={disabled ? undefined : onClick} className="mag" style={{ ...base, ...v[variant], ...style }}>{children}</button>;
}

function Spinner() { return <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><div className="spinner" /></div>; }

function ProductImage({ src, emoji = "📦", size = 200, radius = 12 }) {
  const [err, setErr] = useState(false);
  if (src && !err) return <img src={src} alt="" onError={() => setErr(true)} style={{ width: "100%", height: size, objectFit: "cover", borderRadius: radius, display: "block" }} />;
  return <div style={{ width: "100%", height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size / 3, background: "rgba(90,143,250,0.08)", borderRadius: radius }}>{emoji}</div>;
}

/* ── TOGGLE DARK/LIGHT ────────────────────────────────── */
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const pillRef = useRef(null);
  function handleClick() {
    if (pillRef.current) {
      pillRef.current.style.animation = "none";
      void pillRef.current.offsetWidth;
      pillRef.current.style.animation = "toggleBounce 0.35s cubic-bezier(0.4,0,0.2,1)";
    }
    toggle();
  }
  return (
    <>
      <style>{`@keyframes toggleBounce{0%{transform:scaleX(1)}40%{transform:scaleX(1.15) scaleY(0.88)}70%{transform:scaleX(0.94) scaleY(1.06)}100%{transform:scaleX(1)}}`}</style>
      <div onClick={handleClick} role="switch" aria-checked={isDark} aria-label="Basculer Dark/Light" tabIndex={0}
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleClick()}
        style={{
          position: "relative", display: "flex", alignItems: "center",
          background: isDark ? "rgba(255,255,255,0.07)" : "rgba(90,143,250,0.1)",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(90,143,250,0.22)"}`,
          borderRadius: 9999, padding: 4, cursor: "pointer",
          width: 116, height: 38,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          transition: "all 0.35s ease", userSelect: "none",
        }}
      >
        <div ref={pillRef} style={{
          position: "absolute", width: 50, height: 30,
          background: isDark ? "#fff" : "linear-gradient(135deg,#5A8FFA,#2C3B8F)",
          borderRadius: 9999,
          left: isDark ? "calc(100% - 54px)" : 4,
          boxShadow: isDark ? "0 0 18px rgba(255,255,255,0.2)" : "0 0 16px rgba(90,143,250,0.5)",
          transition: "left 0.4s cubic-bezier(0.4,0,0.2,1), background 0.35s ease",
        }} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, textAlign: "center", fontSize: 13, color: isDark ? "rgba(255,255,255,0.4)" : "#5A8FFA", transition: "color 0.3s", pointerEvents: "none" }}>☀️</div>
        <div style={{ position: "relative", zIndex: 1, flex: 1, textAlign: "center", fontSize: 13, color: isDark ? "#1F1F1F" : "rgba(90,143,250,0.35)", transition: "color 0.3s", pointerEvents: "none" }}>🌙</div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════
   LANDING
════════════════════════════════════════════════════════ */
function Landing({ onVendeur, onLivreur }) {
  const { C, theme } = useTheme();
  useReveal();
  const [nav, setNav] = useState(false);
  useEffect(() => {
    const h = () => setNav(window.scrollY > 40);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", overflowX: "hidden", transition: "background 0.35s ease" }}>
      <style>{FONTS}{G}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 1100, background: theme === "dark" ? "rgba(31,31,31,0.8)" : "rgba(240,242,255,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${C.border}`, borderRadius: 9999, padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 500, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", transition: "all 0.4s" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.terra }}>Jaayma<span style={{ color: C.white }}>.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          <button onClick={onLivreur} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 9999, padding: "8px 16px", fontSize: 12, fontWeight: 600, color: C.gray, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>🛵 Livreur</button>
          <Btn onClick={onVendeur} style={{ fontSize: 12, padding: "9px 18px" }}>Créer ma boutique</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", background: "linear-gradient(135deg,#5A8FFA 0%,#2C3B8F 60%,#1a2240 100%)", display: "flex", alignItems: "center", padding: "120px 5% 80px", position: "relative", overflow: "hidden", backgroundSize: "200% 200%", animation: "gradpan 10s ease infinite" }}>
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(255,255,255,0.06)", top: -120, right: -100 }} />
        <div className="orb" style={{ width: 300, height: 300, background: "rgba(90,143,250,0.2)", bottom: -60, left: "10%", animationDelay: "2s" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 70, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ animation: "slideR .8s ease both .1s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", borderRadius: 9999, padding: "6px 16px", marginBottom: 26, border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 1 }}>🇸🇳 LA PLATEFORME E-COMMERCE DU SÉNÉGAL</span>
              </div>
            </div>
            <h1 style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.1, fontWeight: 800, color: "#fff", marginBottom: 8, animation: "fadeUp .9s ease both .2s" }}>Vends en ligne.</h1>
            <h1 style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.1, fontWeight: 800, marginBottom: 8, animation: "fadeUp .9s ease both .33s" }}><span className="gs">En 3 minutes.</span></h1>
            <h1 style={{ fontSize: "clamp(36px,5vw,64px)", lineHeight: 1.1, fontWeight: 300, color: "rgba(255,255,255,0.45)", marginBottom: 28, animation: "fadeUp .9s ease both .46s" }}>Sans agence.</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.9, marginBottom: 36, maxWidth: 460, animation: "fadeUp .9s ease both .56s" }}>Crée ta boutique avec tes vraies photos, reçois tes commandes sur WhatsApp, coordonne tes livreurs.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp .9s ease both .66s" }}>
              <button onClick={onVendeur} className="mag" style={{ background: "#fff", color: "#2C3B8F", border: "none", borderRadius: 14, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>🚀 Créer ma boutique — Gratuit</button>
              <button onClick={onLivreur} className="mag" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: 14, padding: "14px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>🛵 Espace livreur</button>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 44, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.15)", animation: "fadeUp .9s ease both .8s", flexWrap: "wrap" }}>
              {[["2300", "+", "boutiques"], ["98", "%", "satisfaction"], ["0", " FCFA", "pour démarrer"]].map(([n, s, l]) => (
                <div key={l}><div style={{ fontSize: 30, fontWeight: 800, color: "#fff" }}><AnimNum n={n} />{s}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ width: 340, flexShrink: 0 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 24, padding: 26, border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 40px 80px rgba(0,0,0,0.3)", animation: "scaleIn 1s ease both .5s" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 20 }}>COMMENT ÇA MARCHE</div>
              {[{ icon: "📸", t: "Ajoute tes produits", s: "Photos réelles depuis ton téléphone" }, { icon: "👤", t: "Client commande", s: "Paie via Wave ou Orange Money" }, { icon: "📲", t: "Tu es notifié", s: "WhatsApp instantané" }, { icon: "🛵", t: "Livraison", s: "Coordonne tes livreurs" }].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none", animation: `slideR .6s ease both ${.7 + i * .12}s` }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{s.icon}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{s.t}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{s.s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "80px 5%", background: C.obsidian, transition: "background 0.35s ease" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, color: C.white }}>Une plateforme. <span className="gs">Toutes les fonctions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {[{ icon: "📸", t: "Vraies photos", d: "Upload tes photos produits depuis ton téléphone ou PC.", c: "#5A8FFA" }, { icon: "📲", t: "Notifs WhatsApp", d: "Chaque commande arrive direct sur ton WhatsApp.", c: "#22C55E" }, { icon: "💳", t: "Wave & Orange Money", d: "Paiements intégrés en un clic.", c: "#F59E0B" }, { icon: "🛵", t: "Réseau livreurs", d: "Assigne les commandes en temps réel.", c: "#A855F7" }].map((f, i) => (
              <div key={i} className="reveal ch" style={{ background: C.charcoal, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, transitionDelay: `${i * .09}s`, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: `${f.c}18`, border: `1.5px solid ${f.c}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 }}>{f.t}</div>
                <div style={{ fontSize: 13, color: C.sand, lineHeight: 1.7 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 5%", background: C.obsidian, position: "relative", transition: "background 0.35s ease" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(90,143,250,0.08) 0%,transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, color: C.white }}>Des prix <span className="gs">honnêtes</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "center" }}>
            {[{ n: "Démarrage", p: "Gratuit", f: ["1 boutique", "10 produits", "Photos produits", "Notifs WhatsApp"], feat: false }, { n: "Commerçant", p: "4 900 FCFA/mois", f: ["Produits illimités", "Photos illimitées", "Wave + Orange Money", "Stats avancées"], feat: true }, { n: "Business", p: "14 900 FCFA/mois", f: ["Multi-boutiques", "API livreurs", "Support prioritaire", "Facturation auto"], feat: false }].map((p, i) => (
              <div key={i} className="reveal ch" style={{ background: p.feat ? "linear-gradient(160deg,#5A8FFA,#2C3B8F)" : C.charcoal, backdropFilter: "blur(20px)", borderRadius: 20, padding: p.feat ? 28 : 22, border: `1px solid ${p.feat ? "rgba(90,143,250,0.5)" : C.border}`, transform: p.feat ? "scale(1.04)" : "none", position: "relative", overflow: "hidden", transitionDelay: `${i * .09}s` }}>
                {p.feat && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#F59E0B,#FCD34D)", color: "#1F1F1F", fontSize: 9, fontWeight: 800, padding: "3px 14px", borderRadius: "0 0 8px 8px", letterSpacing: 1 }}>★ POPULAIRE</div>}
                <div style={{ fontSize: 10, fontWeight: 700, color: p.feat ? "rgba(255,255,255,0.7)" : C.sand, letterSpacing: 2, marginBottom: 7 }}>{p.n.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: p.feat ? "#fff" : C.white, marginBottom: 16 }}>{p.p}</div>
                {p.f.map(f => (<div key={f} style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 8 }}><span style={{ color: p.feat ? "#FCD34D" : C.terra, fontSize: 12 }}>✓</span><span style={{ fontSize: 12, color: p.feat ? "rgba(255,255,255,0.85)" : C.sand }}>{f}</span></div>))}
                <div style={{ marginTop: 20 }}><Btn onClick={onVendeur} variant={p.feat ? "gold" : "ghost"} style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>{p.feat ? "Commencer →" : "Choisir"}</Btn></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="reveal" style={{ padding: "60px 5% 100px", background: C.obsidian, textAlign: "center", transition: "background 0.35s ease" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", borderRadius: 28, padding: "50px 40px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(40px)" }} />
          <div style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>Prêt à vendre en ligne ?</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 30, lineHeight: 1.8 }}>Rejoins 2 300+ commerçants sénégalais qui font confiance à Jaayma.</p>
          <button onClick={onVendeur} className="mag" style={{ background: "#fff", color: "#2C3B8F", border: "none", borderRadius: 14, padding: "15px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>🚀 Créer ma boutique gratuitement</button>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "24px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, background: C.obsidian, transition: "background 0.35s ease" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.terra }}>Jaayma<span style={{ color: C.white }}>.</span></div>
        <div style={{ fontSize: 11, color: C.sand }}>© 2026 Jaayma — La plateforme e-commerce du Sénégal 🇸🇳</div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   INSCRIPTION VENDEUR
════════════════════════════════════════════════════════ */
function InscriptionVendeur({ onComplete }) {
  const { C, theme } = useTheme();
  const [step, setStep] = useState("form");
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [lien, setLien] = useState("");
  const [lienErr, setLienErr] = useState(""); const [codeInput, setCodeInput] = useState("");
  const [sending, setSending] = useState(false); const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState(""); const [countdown, setCountdown] = useState(0);

  function hNom(v) { setNom(v); setLien(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }
  function hLien(v) { const c = v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); setLien(c); setLienErr(c.length < 3 ? "Minimum 3 caractères" : ""); }
  const formValid = phone.length >= 9 && nom.length >= 2 && lien.length >= 3 && !lienErr;

  function startCountdown() {
    setCountdown(60);
    const t = setInterval(() => setCountdown(v => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
  }

  async function handleSendCode() {
    if (!formValid) return;
    setSending(true); setErr("");
    try {
      const resp = await fetch("/api/send-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const data = await resp.json();
      if (!resp.ok) { setErr(data.error || "Erreur envoi. Réessaie."); setSending(false); return; }
      setStep("verify"); startCountdown();
    } catch { setErr("Problème de connexion. Réessaie."); }
    setSending(false);
  }

  async function handleVerify() {
    if (codeInput.length !== 6) return;
    setVerifying(true); setErr("");
    try {
      const data = await supaFetch(`verifications?phone=eq.${phone}&select=code,expires_at`);
      if (!data.length) { setErr("Code introuvable. Renvoie un code."); setVerifying(false); return; }
      const { code: stored, expires_at } = data[0];
      if (new Date(expires_at) < new Date()) { setErr("Code expiré. Clique sur Renvoyer."); setVerifying(false); return; }
      if (stored !== codeInput) { setErr("Code incorrect. Réessaie."); setVerifying(false); return; }
      onComplete({ phone, nom, lien });
    } catch { setErr("Erreur de vérification. Réessaie."); }
    setVerifying(false);
  }

  const inp = { width: "100%", padding: "13px 16px", borderRadius: 12, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.06)", border: `1px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Poppins',sans-serif", color: C.white, boxSizing: "border-box", transition: "border-color .3s" };

  return (
    <div className="page" style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden", transition: "background 0.35s ease" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 400, height: 400, background: "rgba(90,143,250,0.12)", top: -80, right: -80 }} />
      <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeToggle /></div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.terra, marginBottom: 30 }}>Jaayma<span style={{ color: C.white }}>.</span></div>

      {step === "form" && (
        <div style={{ background: C.charcoal, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 440, border: `1px solid ${C.border}`, boxShadow: "0 40px 80px rgba(0,0,0,0.15)", animation: "scaleIn .5s ease both" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 4 }}>Crée ta boutique</h2>
          <p style={{ color: C.sand, fontSize: 13, marginBottom: 28 }}>3 informations, c'est tout. 🚀</p>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 7, letterSpacing: 1 }}>NUMÉRO WHATSAPP / SMS</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ padding: "13px 14px", borderRadius: 12, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.06)", border: `1px solid ${C.border}`, fontSize: 13, color: C.sand, flexShrink: 0 }}>🇸🇳 +221</div>
              <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="77 000 00 00" type="tel" maxLength={9} style={{ ...inp, flex: 1 }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 7, letterSpacing: 1 }}>NOM DE TA BOUTIQUE</div>
            <input value={nom} onChange={e => hNom(e.target.value)} placeholder="Ex : Mariama Mode..." style={inp} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 7, letterSpacing: 1 }}>TON LIEN PERSONNALISÉ</div>
            <div style={{ display: "flex", borderRadius: 12, border: `1px solid ${lienErr ? "#EF4444" : C.border}`, overflow: "hidden", background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(90,143,250,0.04)" }}>
              <div style={{ padding: "13px 12px", fontSize: 11, color: C.sand, borderRight: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center" }}>jaayma.sn/</div>
              <input value={lien} onChange={e => hLien(e.target.value)} placeholder="mariama-mode" style={{ flex: 1, padding: "13px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: "'Poppins',sans-serif", color: C.terra, fontWeight: 700, background: "transparent" }} />
            </div>
            {lienErr && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 5 }}>{lienErr}</div>}
            {lien && !lienErr && <div style={{ fontSize: 11, color: C.green, marginTop: 5 }}>✓ jaayma.sn/{lien}</div>}
          </div>
          <div style={{ background: "rgba(90,143,250,0.08)", borderRadius: 11, padding: "10px 14px", marginBottom: 20, marginTop: 14, border: "1px solid rgba(90,143,250,0.2)" }}>
            <div style={{ fontSize: 12, color: C.terra, lineHeight: 1.6 }}>📲 Code envoyé au <strong>+221 {phone || "..."}</strong> par WhatsApp ou SMS</div>
          </div>
          {err && <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 12, padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 10 }}>{err}</div>}
          <Btn onClick={handleSendCode} disabled={!formValid || sending} style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "14px" }}>
            {sending ? "⏳ Envoi du code..." : "📲 Recevoir mon code →"}
          </Btn>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: C.sand }}>Gratuit · Pas de carte bancaire requise</div>
        </div>
      )}

      {step === "verify" && (
        <div style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 440, border: `1px solid ${C.border}`, boxShadow: "0 40px 80px rgba(0,0,0,0.15)", animation: "scaleIn .5s ease both" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📲</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.white, marginBottom: 8 }}>Code envoyé !</h2>
            <p style={{ fontSize: 13, color: C.sand, lineHeight: 1.7 }}>Vérifie ton WhatsApp ou SMS au<br /><strong style={{ color: C.white }}>+221 {phone}</strong></p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 10, letterSpacing: 1, textAlign: "center" }}>ENTRE LE CODE À 6 CHIFFRES</div>
            <input value={codeInput} onChange={e => { setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6)); setErr(""); }} placeholder="000000" type="tel" maxLength={6} style={{ ...inp, fontSize: 28, fontWeight: 800, textAlign: "center", letterSpacing: 12, padding: "16px", color: C.terra }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} autoFocus />
          </div>
          {err && <div style={{ fontSize: 12, color: "#EF4444", marginBottom: 14, padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 10, textAlign: "center" }}>{err}</div>}
          <Btn onClick={handleVerify} disabled={codeInput.length !== 6 || verifying} style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "14px", marginBottom: 14 }}>
            {verifying ? "⏳ Vérification..." : "✓ Confirmer et créer ma boutique"}
          </Btn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => { setStep("form"); setCodeInput(""); setErr(""); }} style={{ background: "none", border: "none", color: C.sand, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>← Changer de numéro</button>
            {countdown > 0 ? <span style={{ fontSize: 12, color: C.sand }}>Renvoyer dans {countdown}s</span> : <button onClick={handleSendCode} style={{ background: "none", border: "none", color: C.terra, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>🔄 Renvoyer</button>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   INSCRIPTION LIVREUR
════════════════════════════════════════════════════════ */
function InscriptionLivreur({ onComplete }) {
  const { C, theme } = useTheme();
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [zone, setZone] = useState("");
  const zones = ["Dakar Plateau", "Médina", "Parcelles Assainies", "Guédiawaye", "Pikine", "Rufisque", "Thiès", "Autre"];
  const inp = { padding: "13px 16px", borderRadius: 12, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.06)", border: `1px solid ${C.border}`, outline: "none", fontSize: 13, fontFamily: "'Poppins',sans-serif", color: C.white, width: "100%", boxSizing: "border-box", transition: "border-color .3s" };
  return (
    <div className="page" style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden", transition: "background 0.35s ease" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 360, height: 360, background: "rgba(90,143,250,0.1)", top: -70, left: -60 }} />
      <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeToggle /></div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.terra, marginBottom: 30 }}>Jaayma<span style={{ color: C.white }}>.</span></div>
      <div style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 440, border: `1px solid ${C.border}`, animation: "scaleIn .5s ease both" }}>
        <div style={{ width: 50, height: 50, borderRadius: 15, background: "rgba(90,143,250,0.15)", border: "1.5px solid rgba(90,143,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>🛵</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 4 }}>Espace Livreur</h2>
        <p style={{ color: C.sand, fontSize: 13, marginBottom: 24 }}>Inscris-toi pour recevoir des missions.</p>
        <div style={{ marginBottom: 13 }}><div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 7, letterSpacing: 1 }}>PRÉNOM ET NOM</div><input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Moussa Diallo" style={inp} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} /></div>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 7, letterSpacing: 1 }}>NUMÉRO WHATSAPP</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "13px 14px", borderRadius: 12, background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.06)", border: `1px solid ${C.border}`, fontSize: 13, color: C.sand, flexShrink: 0 }}>🇸🇳 +221</div>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="77 000 00 00" type="tel" style={{ ...inp, flex: 1 }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 8, letterSpacing: 1 }}>ZONE DE LIVRAISON</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {zones.map(z => <button key={z} onClick={() => setZone(z)} style={{ padding: "9px 10px", borderRadius: 11, border: `1.5px solid ${zone === z ? "#5A8FFA" : C.border}`, background: zone === z ? "rgba(90,143,250,0.15)" : "transparent", color: zone === z ? "#5A8FFA" : C.sand, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .2s" }}>{z}</button>)}
          </div>
        </div>
        <Btn variant="blue" onClick={() => nom && phone && zone && onComplete({ nom, phone, zone })} disabled={!nom || !phone || !zone} style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "14px" }}>🛵 Rejoindre Jaayma →</Btn>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DASHBOARD VENDEUR
════════════════════════════════════════════════════════ */
function DashboardVendeur({ store, onPreview, onLogout }) {
  const { C, theme } = useTheme();
  const [tab, setTab] = useState("accueil");
  const [orders, setOrders] = useState([]); const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); const [sel, setSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: "", price: "", stock: "", image: "📦", image_url: "" });
  const [imageFile, setImageFile] = useState(null); const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null); const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileRef = useRef(null);
  const marchandPhone = store?.phone || "";

  function st(m) { setToast(m); setTimeout(() => setToast(null), 3500); }

  async function loadData() {
    setLoading(true);
    try { const [p, c] = await Promise.all([db.getProduits(marchandPhone), db.getCommandes(marchandPhone)]); setProducts(p); setOrders(c); }
    catch { st("❌ Erreur de chargement."); }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function handleImageSelect(e) {
    const file = e.target.files[0]; if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
  }

  async function addProduct() {
    if (!newP.name || !newP.price) return;
    setSaving(true);
    try {
      let image_url = null;
      if (imageFile) image_url = await uploadImage(imageFile, marchandPhone);
      const added = await db.addProduit({ marchand_phone: marchandPhone, name: newP.name, price: parseInt(newP.price), stock: parseInt(newP.stock) || 0, image: imageFile ? "📷" : newP.image, image_url });
      setProducts([added[0], ...products]);
      setNewP({ name: "", price: "", stock: "", image: "📦", image_url: "" });
      setImageFile(null); setImagePreview(null); setShowAdd(false);
      st("✅ Produit ajouté !");
    } catch (e) { st("❌ Erreur lors de l'ajout. Réessaie."); }
    setSaving(false);
  }

  async function deleteProduct(id) {
    try { await db.deleteProduit(id); setProducts(products.filter(p => p.id !== id)); st("🗑 Produit supprimé."); }
    catch { st("❌ Erreur suppression."); }
  }

  async function assignerLivreur(orderId, livreurNom) {
    try { await db.updateCommande(orderId, { livreur: livreurNom, status: "assigné" }); setOrders(orders.map(o => o.id === orderId ? { ...o, livreur: livreurNom, status: "assigné" } : o)); st(`✅ ${livreurNom} assigné !`); setSel(null); }
    catch { st("❌ Erreur."); }
  }

  async function envoyerMessage(orderId, message) {
    try { await db.updateCommande(orderId, { message, status: "en cours" }); setOrders(orders.map(o => o.id === orderId ? { ...o, message, status: "en cours" } : o)); st("📲 Message enregistré !"); setSel(null); }
    catch { st("❌ Erreur."); }
  }

  const rev = orders.reduce((s, o) => s + (o.montant || 0), 0);
  const nbNew = orders.filter(o => o.status === "nouveau").length;
  const tabs = [{ id: "accueil", icon: "🏠", label: "Accueil" }, { id: "commandes", icon: "🛒", label: "Commandes" }, { id: "produits", icon: "📦", label: "Produits" }, { id: "boutique", icon: "👁", label: "Boutique" }];
  const inp = { width: "100%", padding: "12px 14px", borderRadius: 11, background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(90,143,250,0.05)", border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "'Poppins',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 10, transition: "border-color .3s" };

  const SidebarContent = () => (
    <>
      <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.terra }}>Jaayma<span style={{ color: C.white }}>.</span></div>
      </div>
      <div style={{ padding: "16px 12px 0", flex: 1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMobileMenuOpen(false); if (t.id === "boutique") onPreview(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: tab === t.id ? "rgba(90,143,250,0.15)" : "transparent", color: tab === t.id ? C.terra : C.sand, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, fontFamily: "'Poppins',sans-serif", marginBottom: 3, borderLeft: `3px solid ${tab === t.id ? C.terra : "transparent"}`, transition: "all .2s", textAlign: "left" }}>
            <span style={{ fontSize: 17 }}>{t.icon}</span>{t.label}
            {t.id === "commandes" && nbNew > 0 && <span style={{ marginLeft: "auto", background: C.terra, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 8px" }}>{nbNew}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: "12px 12px 16px" }}>
        <div style={{ background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(90,143,250,0.06)", borderRadius: 13, padding: 13, border: `1px solid ${C.border}`, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(90,143,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏪</div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{store?.nom}</div><div style={{ fontSize: 10, color: C.green }}>● En ligne</div></div>
          </div>
          <ThemeToggle />
        </div>
        <button onClick={onLogout} style={{ width: "100%", padding: "9px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.sand, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .2s" }} onMouseEnter={e => { e.target.style.borderColor = "#EF444466"; e.target.style.color = "#EF4444"; }} onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.sand; }}>
          ↩ Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="page" style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", transition: "background 0.35s ease" }}>
      <style>{FONTS}{G}{`
        @media(max-width:768px){.desk-sidebar{display:none!important}.main-pad{padding:14px!important;padding-bottom:80px!important}}
        @media(min-width:769px){.bottom-nav{display:none!important}}
      `}</style>

      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 3000, background: C.charcoal, backdropFilter: "blur(20px)", color: C.white, borderRadius: 14, padding: "12px 18px", fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.3)", animation: "scaleIn .3s ease both" }}>{toast}</div>}
      {sel && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}><OrderModal order={sel} onAssign={assignerLivreur} onMessage={envoyerMessage} onClose={() => setSel(null)} /></div>}
      {mobileMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1500 }}>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: C.charcoal, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", padding: "24px 0", borderRight: `1px solid ${C.border}`, animation: "slideR .3s ease both" }}>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="desk-sidebar" style={{ width: 220, background: C.charcoal, backdropFilter: "blur(20px)", flexShrink: 0, display: "flex", flexDirection: "column", padding: "24px 0", borderRight: `1px solid ${C.border}` }}>
        <SidebarContent />
      </div>

      <div className="main-pad" style={{ flex: 1, overflow: "auto", padding: 28, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMobileMenuOpen(true)} style={{ background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.08)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "8px 12px", cursor: "pointer", fontSize: 18, color: C.white, display: "block" }}>☰</button>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: C.white, margin: 0 }}>
              {tab === "accueil" && "Bonjour 👋"}
              {tab === "commandes" && "Mes commandes"}
              {tab === "produits" && "Mes produits"}
            </h1>
          </div>
          <Btn variant="ghost" onClick={loadData} style={{ fontSize: 11, padding: "7px 14px" }}>↻ Actualiser</Btn>
        </div>

        {loading ? <Spinner /> : (
          <>
            {tab === "accueil" && (
              <div>
                <div style={{ fontSize: 13, color: C.sand, marginBottom: 24 }}>{store?.nom} · jaayma.sn/{store?.lien}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
                  {[{ label: "Revenus", value: rev.toLocaleString() + " FCFA", icon: "💰", c: C.gold }, { label: "Commandes", value: orders.length, icon: "🛒", c: C.terra }, { label: "Nouvelles", value: nbNew, icon: "🔔", c: "#F59E0B" }, { label: "Produits", value: products.length, icon: "📦", c: C.green }].map((s, i) => (
                    <div key={i} className="ch" style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 16, padding: "18px 16px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: C.sand, marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 11, marginBottom: 24 }}>
                  {[{ icon: "➕", t: "Ajouter produit", s: "Avec photo réelle", action: () => setTab("produits"), c: C.terra }, { icon: "📋", t: "Voir commandes", s: nbNew > 0 ? `${nbNew} nouvelle(s)` : "Aucune nouvelle", action: () => setTab("commandes"), c: C.gold }, { icon: "👁", t: "Ma boutique", s: "Vue client", action: onPreview, c: C.green }].map((a, i) => (
                    <div key={i} onClick={a.action} style={{ background: theme === "dark" ? `${a.c}15` : `${a.c}10`, borderRadius: 14, padding: "16px 18px", border: `1px solid ${a.c}25`, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                      <div style={{ fontSize: 20, marginBottom: 7 }}>{a.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{a.t}</div>
                      <div style={{ fontSize: 11, color: C.sand, marginTop: 3 }}>{a.s}</div>
                    </div>
                  ))}
                </div>
                {orders.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.sand, letterSpacing: 2, marginBottom: 12 }}>DERNIÈRES COMMANDES</div>
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="ch" style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 9, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", cursor: "pointer" }} onClick={() => { setTab("commandes"); setSel(o); }}>
                        <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{o.client_nom}</span><Badge status={o.status} /></div><div style={{ fontSize: 12, color: C.sand }}>{o.article}</div></div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.gold }}>{o.montant?.toLocaleString()} FCFA</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "commandes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders.length === 0 && <div style={{ textAlign: "center", padding: 60, color: C.sand }}><div style={{ fontSize: 44, marginBottom: 14 }}>📭</div><div style={{ fontSize: 15, fontWeight: 600, color: C.sand }}>Aucune commande pour l'instant</div></div>}
                {orders.map(o => (
                  <div key={o.id} className="ch" style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}><span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{o.client_nom}</span><Badge status={o.status} /></div>
                      <div style={{ fontSize: 12, color: C.sand }}>{o.article}</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 11, color: C.gray, flexWrap: "wrap" }}>
                        <span>📱 {o.client_phone}</span><span>💳 {o.payment}</span>
                        {o.livreur && <span>🛵 {o.livreur}</span>}
                        <span>{new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, marginBottom: 8 }}>{o.montant?.toLocaleString()} FCFA</div>
                      {(o.status === "nouveau" || o.status === "assigné") && <Btn onClick={() => setSel(o)} style={{ fontSize: 12, padding: "8px 14px" }}>Gérer →</Btn>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "produits" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Btn onClick={() => { setShowAdd(!showAdd); setImageFile(null); setImagePreview(null); }} style={{ fontSize: 13 }}>
                    {showAdd ? "✕ Annuler" : "📸 Nouveau produit"}
                  </Btn>
                </div>
                {showAdd && (
                  <div style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 18, padding: 22, marginBottom: 18, border: "1.5px solid rgba(90,143,250,0.25)", animation: "scaleIn .3s ease both" }}>
                    <div style={{ fontWeight: 700, color: C.white, marginBottom: 16, fontSize: 15 }}>Nouveau produit</div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: C.sand, marginBottom: 8, letterSpacing: 1 }}>PHOTO DU PRODUIT</div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                      {imagePreview ? (
                        <div style={{ position: "relative", marginBottom: 8 }}>
                          <img src={imagePreview} alt="" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12 }} />
                          <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                      ) : (
                        <div className="img-upload-zone" onClick={() => fileRef.current?.click()}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.sand }}>Appuie pour ajouter une photo</div>
                          <div style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>Depuis ta galerie ou ton appareil photo</div>
                        </div>
                      )}
                    </div>
                    <input value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} placeholder="Nom du produit" style={inp} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
                      <input value={newP.price} onChange={e => setNewP({ ...newP, price: e.target.value })} placeholder="Prix (FCFA)" type="number" style={{ ...inp, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
                      <input value={newP.stock} onChange={e => setNewP({ ...newP, stock: e.target.value })} placeholder="Stock" type="number" style={{ ...inp, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
                    </div>
                    {!imageFile && (
                      <div style={{ marginBottom: 14, marginTop: 10 }}>
                        <div style={{ fontSize: 10, color: C.sand, marginBottom: 8 }}>OU CHOISIS UN EMOJI</div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                          {["📦", "👗", "👠", "🧵", "🎨", "📿", "🌿", "💄", "🍎", "📱", "🧴", "👒"].map(e => (
                            <button key={e} onClick={() => setNewP({ ...newP, image: e })} style={{ width: 38, height: 38, borderRadius: 10, border: `2px solid ${newP.image === e ? "#5A8FFA" : C.border}`, background: newP.image === e ? "rgba(90,143,250,0.15)" : "transparent", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <Btn onClick={addProduct} disabled={saving || !newP.name || !newP.price} style={{ width: "100%", justifyContent: "center", fontSize: 14, marginTop: 6 }}>
                      {saving ? "⏳ Upload en cours..." : "✓ Ajouter le produit"}
                    </Btn>
                  </div>
                )}
                {products.length === 0 && !showAdd && (
                  <div style={{ textAlign: "center", padding: 60 }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>📦</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.sand, marginBottom: 20 }}>Aucun produit encore</div>
                    <Btn onClick={() => setShowAdd(true)}>📸 Ajouter un produit</Btn>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
                  {products.map(p => (
                    <div key={p.id} className="ch" style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative" }}>
                      <button onClick={() => deleteProduct(p.id)} style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      <ProductImage src={p.image_url} emoji={p.image} size={140} radius={0} />
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4, paddingRight: 24 }}>{p.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, marginBottom: 3 }}>{p.price?.toLocaleString()} FCFA</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: p.stock > 5 ? "#4ADE80" : p.stock > 0 ? "#F59E0B" : "#EF4444" }}>Stock : {p.stock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: theme === "dark" ? "rgba(37,37,37,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 1000 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { if (t.id === "boutique") { onPreview(); } else { setTab(t.id); } }}
            style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === t.id ? C.terra : C.sand, transition: "color .2s" }}>
            <span style={{ fontSize: 20, position: "relative" }}>
              {t.icon}
              {t.id === "commandes" && nbNew > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: C.terra, color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{nbNew}</span>}
            </span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500, fontFamily: "'Poppins',sans-serif" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ORDER MODAL
════════════════════════════════════════════════════════ */
function OrderModal({ order, onAssign, onMessage, onClose }) {
  const { C } = useTheme();
  const [step, setStep] = useState("detail");
  const [msg, setMsg] = useState(`Salam ${order.client_nom} ! Merci pour votre commande.\n\nArticle : ${order.article}\nMontant : ${order.montant?.toLocaleString()} FCFA\nDelai : 2-3 heures\n\nNous vous contacterons a l'arrivee.`);
  const [livreurInput, setLivreurInput] = useState("");
  return (
    <div style={{ background: C.charcoal, backdropFilter: "blur(24px)", borderRadius: 22, width: "100%", maxWidth: 460, maxHeight: "88vh", overflow: "auto", padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 40px 80px rgba(0,0,0,0.5)", animation: "scaleIn .3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div style={{ fontSize: 17, fontWeight: 800, color: C.white }}>Commande</div><div style={{ fontSize: 12, color: C.sand }}>{order.client_nom}</div></div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${C.border}`, borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, color: C.sand, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      {step === "detail" && (<>
        <div style={{ background: "rgba(90,143,250,0.05)", borderRadius: 13, padding: 15, marginBottom: 16, border: `1px solid ${C.border}` }}>
          {[["Client", order.client_nom], ["Téléphone", order.client_phone], ["Article", order.article], ["Montant", (order.montant?.toLocaleString() || 0) + " FCFA"], ["Adresse", order.client_adresse || "Non renseignée"], ["Paiement", order.payment]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: C.sand, fontWeight: 500 }}>{k}</span><span style={{ color: C.white, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="blue" onClick={() => setStep("livreur")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px" }}>🛵 Assigner</Btn>
          <Btn onClick={() => setStep("message")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px" }}>📲 Message</Btn>
        </div>
      </>)}
      {step === "livreur" && (<>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 11, fontSize: 14 }}>Nom du livreur</div>
        <input value={livreurInput} onChange={e => setLivreurInput(e.target.value)} placeholder="Ex : Moussa Diallo" style={{ width: "100%", padding: "12px 14px", borderRadius: 11, background: "rgba(90,143,250,0.06)", border: `1px solid ${C.border}`, outline: "none", fontSize: 13, fontFamily: "'Poppins',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 14 }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px" }}>← Retour</Btn>
          <Btn variant="blue" onClick={() => livreurInput && onAssign(order.id, livreurInput)} disabled={!livreurInput} style={{ flex: 2, justifyContent: "center", fontSize: 13, padding: "11px" }}>✓ Confirmer</Btn>
        </div>
      </>)}
      {step === "message" && (<>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 4, fontSize: 14 }}>Message au client</div>
        <div style={{ fontSize: 11, color: C.sand, marginBottom: 11 }}>{order.client_nom} — {order.client_phone}</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 13, border: `1.5px solid ${C.border}`, fontSize: 12, fontFamily: "'Poppins',sans-serif", color: C.white, background: "rgba(90,143,250,0.05)", minHeight: 140, resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, outline: "none" }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 9, marginTop: 11 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px" }}>← Retour</Btn>
          <Btn onClick={() => onMessage(order.id, msg)} style={{ flex: 2, justifyContent: "center", fontSize: 13, padding: "11px" }}>📲 Enregistrer →</Btn>
        </div>
      </>)}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   BOUTIQUE CLIENT
════════════════════════════════════════════════════════ */
function BoutiqueClient({ store, onBack }) {
  const { C, theme } = useTheme();
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]); const [view, setView] = useState("store");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ nom: "", phone: "", adresse: "", payment: "" });
  const [submitting, setSubmitting] = useState(false);
  const marchandPhone = store?.phone || "";

  useEffect(() => { db.getProduits(marchandPhone).then(p => { setProducts(p); setLoading(false); }).catch(() => setLoading(false)); }, []);

  function addToCart(p, qty = 1) { setCart(prev => { const e = prev.find(i => i.id === p.id); return e ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i) : [...prev, { ...p, qty }]; }); }
  function removeFromCart(id) { setCart(prev => prev.filter(i => i.id !== id)); }
  function updateQty(id, qty) { if (qty < 1) { removeFromCart(id); return; } setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i)); }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  async function confirmerCommande() {
    if (!form.nom || !form.phone || !form.payment) return;
    setSubmitting(true);
    try {
      const cmdId = `CMD-${Date.now()}`;
      const article = cart.map(i => `${i.name} x${i.qty}`).join(", ");
      await db.addCommande({ id: cmdId, marchand_phone: marchandPhone, client_nom: form.nom, client_phone: form.phone, client_adresse: form.adresse, article, montant: total, payment: form.payment, status: "nouveau" });
      if (form.payment === "🚚 Paiement à la livraison") { setView("confirmed"); setSubmitting(false); return; }
      const resp = await fetch("/api/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ montant: total, description: article, client_nom: form.nom, client_phone: form.phone, commande_id: cmdId }) });
      const data = await resp.json();
      if (data.payment_url) { window.location.href = data.payment_url; } else { setView("confirmed"); }
    } catch { alert("Erreur. Réessaie."); }
    setSubmitting(false);
  }

  const inp = { width: "100%", padding: "13px 15px", borderRadius: 12, background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(90,143,250,0.05)", border: `1.5px solid ${C.border}`, outline: "none", fontSize: 13, fontFamily: "'Poppins',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 10, transition: "border-color .3s" };

  return (
    <div className="page" style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", maxWidth: 480, margin: "0 auto", transition: "background 0.35s ease" }}>
      <style>{FONTS}{G}</style>
      <div style={{ background: C.charcoal, backdropFilter: "blur(20px)", padding: "16px 16px 0", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, paddingBottom: 16 }}>
          <button onClick={onBack} style={{ background: "rgba(90,143,250,0.08)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: C.sand, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif", flexShrink: 0 }}>← Retour</button>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(90,143,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏪</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store?.nom}</div>
            <div style={{ fontSize: 10, color: C.sand }}>jaayma.sn/{store?.lien}</div>
          </div>
          {count > 0 && (
            <button onClick={() => setView("cart")} style={{ background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", border: "none", borderRadius: 12, padding: "7px 14px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", flexShrink: 0 }}>
              🛒 {count}
            </button>
          )}
        </div>
      </div>

      {selectedProduct && view === "store" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: C.obsidian, maxWidth: 480, margin: "0 auto", overflow: "auto", animation: "pageIn .3s ease both" }}>
          <div style={{ position: "sticky", top: 0, background: C.charcoal, backdropFilter: "blur(20px)", padding: "16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSelectedProduct(null)} style={{ background: "rgba(90,143,250,0.08)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: C.sand, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>← Retour</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{selectedProduct.name}</span>
          </div>
          <ProductImage src={selectedProduct.image_url} emoji={selectedProduct.image} size={280} radius={0} />
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, marginBottom: 6 }}>{selectedProduct.name}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: C.gold, marginBottom: 16 }}>{selectedProduct.price?.toLocaleString()} <span style={{ fontSize: 14 }}>FCFA</span></div>
            <div style={{ fontSize: 12, color: selectedProduct.stock > 0 ? "#4ADE80" : "#EF4444", fontWeight: 600, marginBottom: 24 }}>
              {selectedProduct.stock > 0 ? `✓ En stock (${selectedProduct.stock} disponibles)` : "✗ Rupture de stock"}
            </div>
            {selectedProduct.stock > 0 && <Btn onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "16px" }}>Ajouter au panier →</Btn>}
          </div>
        </div>
      )}

      {view === "store" && !selectedProduct && (
        <div style={{ padding: "16px 14px" }}>
          {loading ? <Spinner /> : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: C.sand }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🏪</div>
              <div style={{ fontSize: 14 }}>Cette boutique n'a pas encore de produits.</div>
            </div>
          ) : (
            <>
              <div style={{ background: "linear-gradient(135deg,rgba(90,143,250,0.15),rgba(44,59,143,0.1))", borderRadius: 16, padding: "20px 18px", marginBottom: 20, border: "1px solid rgba(90,143,250,0.25)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(90,143,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏪</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: C.white }}>{store?.nom}</div>
                  <div style={{ fontSize: 12, color: C.sand, marginTop: 2 }}>{products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {products.map(p => (
                  <div key={p.id} className="ch" style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer" }} onClick={() => setSelectedProduct(p)}>
                    <ProductImage src={p.image_url} emoji={p.image} size={140} radius={0} />
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{p.price?.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {view === "cart" && (
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setView("store")} style={{ background: "rgba(90,143,250,0.08)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: C.sand, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>← Retour</button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.white }}>Mon panier</h3>
          </div>
          {cart.map(item => (
            <div key={item.id} style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 14, marginBottom: 10, border: `1px solid ${C.border}`, display: "flex", overflow: "hidden" }}>
              <div style={{ width: 80, flexShrink: 0 }}><ProductImage src={item.image_url} emoji={item.image} size={80} radius={0} /></div>
              <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{item.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(90,143,250,0.08)", border: `1px solid ${C.border}`, cursor: "pointer", color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: C.sand, cursor: "pointer", fontSize: 13 }}>Suppr.</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: C.charcoal, borderRadius: 14, padding: "16px 18px", marginTop: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: C.sand }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>{total.toLocaleString()} FCFA</span>
            </div>
            <button onClick={() => setView("checkout")} style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", boxShadow: "0 4px 20px rgba(90,143,250,0.35)" }}>
              Commander — {total.toLocaleString()} FCFA →
            </button>
          </div>
        </div>
      )}

      {view === "checkout" && (
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setView("cart")} style={{ background: "rgba(90,143,250,0.08)", border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: C.sand, fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>← Retour</button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.white }}>Finaliser</h3>
          </div>
          <div style={{ background: C.charcoal, borderRadius: 14, padding: "14px 16px", marginBottom: 20, border: `1px solid ${C.border}` }}>
            {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}><span style={{ color: C.sand }}>{i.name} x{i.qty}</span><span style={{ color: C.white, fontWeight: 600 }}>{(i.price * i.qty).toLocaleString()} FCFA</span></div>)}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 14, fontWeight: 800 }}>
              <span style={{ color: C.sand }}>Total</span><span style={{ color: C.gold }}>{total.toLocaleString()} FCFA</span>
            </div>
          </div>
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom complet" style={inp} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone WhatsApp" style={inp} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.adresse || ""} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Adresse de livraison" style={{ ...inp, marginBottom: 18 }} onFocus={e => e.target.style.borderColor = "#5A8FFA"} onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 10, letterSpacing: 1 }}>MODE DE PAIEMENT</div>
            {["📱 Wave", "🟠 Orange Money", "🚚 Paiement à la livraison"].map(m => (
              <button key={m} onClick={() => setForm({ ...form, payment: m })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 15px", marginBottom: 8, borderRadius: 13, border: `1.5px solid ${form.payment === m ? "#5A8FFA" : C.border}`, background: form.payment === m ? "rgba(90,143,250,0.12)" : "transparent", color: form.payment === m ? "#5A8FFA" : C.sand, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", textAlign: "left", transition: "all .2s" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.payment === m ? "#5A8FFA" : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {form.payment === m && <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#5A8FFA", display: "block" }} />}
                </span>
                {m}
              </button>
            ))}
          </div>
          <button disabled={!form.nom || !form.phone || !form.payment || submitting} onClick={confirmerCommande}
            style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: !form.nom || !form.phone || !form.payment ? "rgba(90,143,250,0.15)" : "linear-gradient(135deg,#5A8FFA,#2C3B8F)", color: !form.nom || !form.phone || !form.payment ? C.sand : "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .3s", boxShadow: form.nom && form.phone && form.payment ? "0 4px 20px rgba(90,143,250,0.35)" : "none" }}>
            {submitting ? "⏳ Enregistrement..." : "✓ Confirmer la commande"}
          </button>
        </div>
      )}

      {view === "confirmed" && (
        <div style={{ padding: 36, textAlign: "center", animation: "scaleIn .5s ease both" }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.white, marginBottom: 12 }}>Commande confirmée !</h2>
          <div style={{ background: C.charcoal, backdropFilter: "blur(20px)", borderRadius: 18, padding: 20, marginBottom: 22, textAlign: "left", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, marginBottom: 13, letterSpacing: 1 }}>VOUS ALLEZ RECEVOIR</div>
            {["📲 Un message WhatsApp du vendeur", "🛵 Notification quand le livreur arrive", "✅ Confirmation à la livraison"].map(s => (
              <div key={s} style={{ fontSize: 13, color: C.sand, marginBottom: 8, display: "flex", gap: 9 }}><span style={{ color: C.green }}>✓</span>{s.split(" ").slice(1).join(" ")}</div>
            ))}
          </div>
          <Btn onClick={() => { setView("store"); setCart([]); setForm({ nom: "", phone: "", adresse: "", payment: "" }); }}>Retour à la boutique</Btn>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DASHBOARD LIVREUR
════════════════════════════════════════════════════════ */
function DashboardLivreur({ livreur }) {
  const { C } = useTheme();
  return (
    <div className="page" style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", transition: "background 0.35s ease" }}>
      <style>{FONTS}{G}</style>
      <div style={{ background: "linear-gradient(135deg,#5A8FFA,#2C3B8F)", padding: "20px 20px 24px", display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛵</div>
        <div><div style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>Jaayma Livreur</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{livreur?.nom} · {livreur?.zone}</div></div>
        <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: "#fff" }}>● Disponible</div>
      </div>
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🛵</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 }}>Bienvenue {livreur?.nom} !</div>
        <div style={{ fontSize: 13, color: C.sand }}>Les missions te seront assignées par les vendeurs.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   APP ROOT
════════════════════════════════════════════════════════ */
export default function App() {
  const savedTheme = (() => { try { return localStorage.getItem("jaayma_theme") || "dark"; } catch { return "dark"; } })();
  const [theme, setTheme] = useState(savedTheme);
  const C = theme === "dark" ? DARK_C : LIGHT_C;
  function toggle() { setTheme(t => { const n = t === "dark" ? "light" : "dark"; localStorage.setItem("jaayma_theme", n); return n; }); }

  const saved = (() => { try { const s = localStorage.getItem("jaayma_session"); return s ? JSON.parse(s) : null; } catch { return null; } })();
  const [screen, setScreen] = useState(saved ? "dashboard-vendeur" : "landing");
  const [storeData, setStoreData] = useState(saved);
  const [livreurData, setLivreurData] = useState(null);

  function handleVendeurComplete(d) { localStorage.setItem("jaayma_session", JSON.stringify(d)); setStoreData(d); setScreen("dashboard-vendeur"); }
  function handleLogout() { localStorage.removeItem("jaayma_session"); setStoreData(null); setScreen("landing"); }

  return (
    <ThemeCtx.Provider value={{ C, theme, toggle }}>
      {screen === "landing" && <Landing onVendeur={() => setScreen("inscription-vendeur")} onLivreur={() => setScreen("inscription-livreur")} />}
      {screen === "inscription-vendeur" && <InscriptionVendeur onComplete={handleVendeurComplete} />}
      {screen === "inscription-livreur" && <InscriptionLivreur onComplete={d => { setLivreurData(d); setScreen("dashboard-livreur"); }} />}
      {screen === "dashboard-vendeur" && <DashboardVendeur store={storeData} onPreview={() => setScreen("boutique-client")} onLogout={handleLogout} />}
      {screen === "dashboard-livreur" && <DashboardLivreur livreur={livreurData} />}
      {screen === "boutique-client" && <BoutiqueClient store={storeData} onBack={() => setScreen("dashboard-vendeur")} />}
    </ThemeCtx.Provider>
  );
}
