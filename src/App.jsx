import { useState, useEffect, useRef } from "react";

/* ── SUPABASE ─────────────────────────────────────────── */
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  const ext = file.name.split('.').pop();
  const path = `${phone}/${Date.now()}.${ext}`;
  const res = await fetch(`${SUPA_URL}/storage/v1/object/produits/${path}`, {
    method: "POST",
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": `Bearer ${SUPA_KEY}`,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: file,
  });
  if (!res.ok) throw new Error("Upload failed");
  return `${SUPA_URL}/storage/v1/object/public/produits/${path}`;
}

const db = {
  getProduits: (phone) => supaFetch(`produits?marchand_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc`),
  addProduit: (p) => supaFetch("produits", { method: "POST", body: JSON.stringify(p) }),
  deleteProduit: (id) => supaFetch(`produits?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" }),
  getCommandes: (phone) => supaFetch(`commandes?marchand_phone=eq.${encodeURIComponent(phone)}&order=created_at.desc`),
  addCommande: (c) => supaFetch("commandes", { method: "POST", body: JSON.stringify(c) }),
  updateCommande: (id, u) => supaFetch(`commandes?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(u), prefer: "return=minimal" }),
};

/* ── COULEURS ─────────────────────────────────────────── */
const C = {
  obsidian: "#0A0705", charcoal: "#141010", ember: "#1E1510",
  terra: "#C4572A", terr2: "#E06535", gold: "#E8A020", gold2: "#F5C842",
  green: "#1A7A4A", white: "#FFFFFF", border: "#2A1F18",
  delivery: "#2563EB", sand: "#D4A574", gray: "#8C7B6E",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');`;

const G = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:${C.obsidian};overflow-x:hidden}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:${C.obsidian}}
::-webkit-scrollbar-thumb{background:${C.terra};border-radius:2px}
@keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 ${C.terra}55}70%{box-shadow:0 0 0 10px ${C.terra}00}}
@keyframes pageIn{from{opacity:0;transform:translateX(40px) scale(0.98)}to{opacity:1;transform:translateX(0) scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
.reveal.on{opacity:1;transform:translateY(0)}
.mag{transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease}
.mag:hover{transform:translateY(-2px) scale(1.02)}
.mag:active{transform:scale(0.98)}
.ch{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
.ch:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(196,87,42,.15);border-color:${C.terra}44!important}
.gs{background:linear-gradient(90deg,${C.gold},${C.gold2},${C.sand},${C.gold});background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
.page{animation:pageIn .45s cubic-bezier(.34,.8,.64,1) both}
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:float 6s ease-in-out infinite}
.spinner{width:32px;height:32px;border:3px solid ${C.border};border-top:3px solid ${C.terra};border-radius:50%;animation:spin .8s linear infinite}
.img-upload-zone{border:2px dashed ${C.border};border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;background:${C.white}04}
.img-upload-zone:hover{border-color:${C.terra};background:${C.terra}0A}
`;

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
  const m = { nouveau: { bg: "#3D2A0A", c: C.gold, l: "Nouveau" }, "en cours": { bg: "#0A1A3D", c: "#60A5FA", l: "En cours" }, livré: { bg: "#0A2A1A", c: "#4ADE80", l: "Livré" }, assigné: { bg: "#1A0A3D", c: "#A78BFA", l: "Assigné" } };
  const s = m[status] || m.nouveau;
  return <span style={{ background: s.bg, color: s.c, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 700, fontFamily: "'Outfit',sans-serif", border: `1px solid ${s.c}33` }}>{s.l}</span>;
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled = false }) {
  const base = { border: "none", cursor: disabled ? "default" : "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 700, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.38 : 1 };
  const v = {
    primary: { background: `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, padding: "13px 28px", fontSize: 14, boxShadow: `0 4px 20px ${C.terra}44` },
    gold: { background: `linear-gradient(135deg,${C.gold},${C.gold2})`, color: C.obsidian, padding: "13px 28px", fontSize: 14 },
    ghost: { background: `${C.white}08`, color: C.white, padding: "12px 24px", fontSize: 14, border: `1px solid ${C.white}15` },
    blue: { background: `linear-gradient(135deg,${C.delivery},#3B82F6)`, color: C.white, padding: "13px 28px", fontSize: 14 },
  };
  return <button onClick={disabled ? undefined : onClick} className="mag" style={{ ...base, ...v[variant], ...style }}>{children}</button>;
}

function Spinner() { return <div style={{ display: "flex", justifyContent: "center", padding: 48 }}><div className="spinner" /></div>; }

function ProductImage({ src, emoji = "📦", size = 200, radius = 12 }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt="" onError={() => setErr(true)} style={{ width: "100%", height: size, objectFit: "cover", borderRadius: radius, display: "block" }} />;
  }
  return <div style={{ width: "100%", height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size / 3, background: `${C.white}06`, borderRadius: radius }}>{emoji}</div>;
}

/* ════════════════════════════════════════════════════════
   LANDING
════════════════════════════════════════════════════════ */
function Landing({ onVendeur, onLivreur }) {
  useReveal();
  const [nav, setNav] = useState(false);
  const bg = useRef(null);
  useEffect(() => {
    const h = () => { setNav(window.scrollY > 40); if (bg.current) bg.current.style.transform = `translateY(${window.scrollY * 0.15}px)`; };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{FONTS}{G}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: nav ? `${C.obsidian}F0` : "transparent", backdropFilter: nav ? "blur(20px)" : "none", borderBottom: nav ? `1px solid ${C.border}` : "none", transition: "all .4s", animation: "fadeIn .8s ease both" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: C.white }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onLivreur} style={{ fontSize: 12, padding: "8px 14px" }}>🛵 Livreur</Btn>
          <Btn onClick={onVendeur} style={{ fontSize: 12, padding: "10px 18px" }}>Créer ma boutique</Btn>
        </div>
      </nav>

      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", padding: "100px 5% 60px", overflow: "hidden" }}>
        <div className="orb" style={{ width: 550, height: 550, background: `${C.terra}18`, top: -100, right: -100 }} />
        <div className="orb" style={{ width: 350, height: 350, background: `${C.gold}0D`, bottom: -40, left: "15%", animationDelay: "2s" }} />
        <div ref={bg} style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `repeating-linear-gradient(45deg,${C.gold} 0,${C.gold} 1px,transparent 0,transparent 50%)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 70, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ animation: "slideR .8s ease both .1s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.gold}14`, borderRadius: 100, padding: "6px 16px", marginBottom: 26, border: `1px solid ${C.gold}25` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>🇸🇳 LA PLATEFORME E-COMMERCE DU SÉNÉGAL</span>
              </div>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(38px,5.5vw,70px)", lineHeight: 1.06, fontWeight: 700, color: C.white, marginBottom: 6, animation: "fadeUp .9s ease both .2s" }}>Vends en ligne.</h1>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(38px,5.5vw,70px)", lineHeight: 1.06, fontWeight: 700, marginBottom: 6, animation: "fadeUp .9s ease both .33s" }}><span className="gs">En 3 minutes.</span></h1>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(38px,5.5vw,70px)", lineHeight: 1.06, fontWeight: 300, fontStyle: "italic", color: `${C.white}50`, marginBottom: 28, animation: "fadeUp .9s ease both .46s" }}>Sans agence.</h1>
            <p style={{ fontSize: 15, color: `${C.white}65`, lineHeight: 1.9, marginBottom: 36, maxWidth: 460, animation: "fadeUp .9s ease both .56s" }}>Crée ta boutique avec tes vraies photos, reçois tes commandes sur WhatsApp, coordonne tes livreurs.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp .9s ease both .66s" }}>
              <Btn onClick={onVendeur} style={{ fontSize: 14, padding: "15px 30px" }}>🚀 Créer ma boutique — Gratuit</Btn>
              <Btn variant="ghost" onClick={onLivreur} style={{ fontSize: 14, padding: "15px 26px" }}>🛵 Espace livreur</Btn>
            </div>
            <div style={{ display: "flex", gap: 36, marginTop: 44, paddingTop: 32, borderTop: `1px solid ${C.border}`, animation: "fadeUp .9s ease both .8s", flexWrap: "wrap" }}>
              {[["2300", "+", "boutiques"], ["98", "%", "satisfaction"], ["0", " FCFA", "pour démarrer"]].map(([n, s, l]) => (
                <div key={l}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: C.terra }}><AnimNum n={n} />{s}</div><div style={{ fontSize: 11, color: `${C.white}38`, marginTop: 3 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ width: 340, flexShrink: 0 }}>
            <div style={{ background: `linear-gradient(160deg,${C.charcoal},${C.ember})`, borderRadius: 26, padding: 26, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.6)`, animation: "scaleIn 1s ease both .5s" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}30`, letterSpacing: 2, marginBottom: 20 }}>COMMENT ÇA MARCHE</div>
              {[{ icon: "📸", color: C.terra, t: "Ajoute tes produits", s: "Photos réelles depuis ton téléphone" }, { icon: "👤", color: "#7C3AED", t: "Client commande", s: "Paie via Wave ou Orange Money" }, { icon: "📲", color: C.gold, t: "Tu es notifié", s: "WhatsApp instantané" }, { icon: "🛵", color: C.delivery, t: "Livraison", s: "Coordonne tes livreurs" }].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none", animation: `slideR .6s ease both ${.7 + i * .12}s` }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: `${s.color}1E`, border: `1.5px solid ${s.color}38`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{s.icon}</div>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{s.t}</div><div style={{ fontSize: 11, color: `${C.white}42`, marginTop: 2 }}>{s.s}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, color: C.white }}>Une plateforme. <span className="gs">Toutes les fonctions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {[{ icon: "📸", t: "Vraies photos", d: "Upload tes photos produits depuis ton téléphone ou PC.", c: C.terra }, { icon: "📲", t: "Notifs WhatsApp", d: "Chaque commande arrive direct sur ton WhatsApp.", c: C.gold }, { icon: "💳", t: "Wave & Orange Money", d: "Paiements intégrés en un clic.", c: "#22C55E" }, { icon: "🛵", t: "Réseau livreurs", d: "Assigne les commandes en temps réel.", c: C.delivery }].map((f, i) => (
              <div key={i} className="reveal ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, transitionDelay: `${i * .09}s` }}>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: `${f.c}1E`, border: `1.5px solid ${f.c}38`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 8 }}>{f.t}</div>
                <div style={{ fontSize: 13, color: `${C.white}55`, lineHeight: 1.7 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 5%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,${C.terra}0E 0%,transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 700, color: C.white }}>Des prix <span className="gs">honnêtes</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, alignItems: "center" }}>
            {[{ n: "Démarrage", p: "Gratuit", f: ["1 boutique", "10 produits", "Photos produits", "Notifs WhatsApp"], feat: false }, { n: "Commerçant", p: "4 900 FCFA/mois", f: ["Produits illimités", "Photos illimitées", "Wave + Orange Money", "Stats avancées"], feat: true }, { n: "Business", p: "14 900 FCFA/mois", f: ["Multi-boutiques", "API livreurs", "Support prioritaire", "Facturation auto"], feat: false }].map((p, i) => (
              <div key={i} className="reveal ch" style={{ background: p.feat ? `linear-gradient(160deg,${C.terra},#9A3A18)` : `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 20, padding: p.feat ? 28 : 22, border: `1px solid ${p.feat ? C.terra + "88" : C.border}`, transform: p.feat ? "scale(1.04)" : "none", position: "relative", overflow: "hidden", transitionDelay: `${i * .09}s` }}>
                {p.feat && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(90deg,${C.gold},${C.gold2})`, color: C.obsidian, fontSize: 9, fontWeight: 800, padding: "3px 14px", borderRadius: "0 0 8px 8px", letterSpacing: 1 }}>★ POPULAIRE</div>}
                <div style={{ fontSize: 10, fontWeight: 700, color: p.feat ? `${C.white}AA` : `${C.white}40`, letterSpacing: 2, marginBottom: 7 }}>{p.n.toUpperCase()}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 16 }}>{p.p}</div>
                {p.f.map(f => (<div key={f} style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 8 }}><span style={{ color: p.feat ? C.gold : C.terra, fontSize: 12 }}>✓</span><span style={{ fontSize: 12, color: p.feat ? C.white : `${C.white}68` }}>{f}</span></div>))}
                <div style={{ marginTop: 20 }}><Btn onClick={onVendeur} variant={p.feat ? "gold" : "ghost"} style={{ width: "100%", justifyContent: "center", fontSize: 12 }}>{p.feat ? "Commencer →" : "Choisir"}</Btn></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal" style={{ padding: "60px 5% 100px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 28, padding: "50px 40px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: `${C.terra}1A`, filter: "blur(40px)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,4vw,40px)", fontWeight: 700, color: C.white, marginBottom: 12 }}>Prêt à vendre en ligne ?</div>
          <p style={{ fontSize: 14, color: `${C.white}55`, marginBottom: 30, lineHeight: 1.8 }}>Rejoins 2 300+ commerçants sénégalais qui font confiance à Jaayma.</p>
          <Btn onClick={onVendeur} style={{ fontSize: 15, padding: "16px 36px" }}>🚀 Créer ma boutique gratuitement</Btn>
        </div>
      </section>
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "24px 5%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.white }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
        <div style={{ fontSize: 11, color: `${C.white}28` }}>© 2026 Jaayma — La plateforme e-commerce du Sénégal 🇸🇳</div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   INSCRIPTION VENDEUR
════════════════════════════════════════════════════════ */
function InscriptionVendeur({ onComplete }) {
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [lien, setLien] = useState(""); const [err, setErr] = useState("");
  function hNom(v) { setNom(v); setLien(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }
  function hLien(v) { const c = v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); setLien(c); setErr(c.length < 3 ? "Minimum 3 caractères" : ""); }
  const valid = phone.length >= 9 && nom.length >= 2 && lien.length >= 3;
  const inp = { width: "100%", padding: "13px 16px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", transition: "border-color .3s" };
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 450, height: 450, background: `${C.terra}12`, top: -80, right: -80 }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.white, marginBottom: 30 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 440, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.5)`, animation: "scaleIn .5s ease both" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: C.white, marginBottom: 4, fontWeight: 700 }}>Crée ta boutique</h2>
        <p style={{ color: `${C.white}45`, fontSize: 13, marginBottom: 28 }}>3 informations, c'est tout. 🚀</p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}42`, marginBottom: 7, letterSpacing: 1 }}>NUMÉRO WHATSAPP</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "13px 14px", borderRadius: 12, background: `${C.white}08`, border: `1px solid ${C.border}`, fontSize: 13, color: `${C.white}60`, flexShrink: 0 }}>🇸🇳 +221</div>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="77 000 00 00" type="tel" maxLength={9} style={{ ...inp, flex: 1 }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}42`, marginBottom: 7, letterSpacing: 1 }}>NOM DE TA BOUTIQUE</div>
          <input value={nom} onChange={e => hNom(e.target.value)} placeholder="Ex : Mariama Mode..." style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}42`, marginBottom: 7, letterSpacing: 1 }}>TON LIEN PERSONNALISÉ</div>
          <div style={{ display: "flex", borderRadius: 12, border: `1px solid ${err ? C.terra : C.border}`, overflow: "hidden", background: `${C.white}06` }}>
            <div style={{ padding: "13px 12px", background: `${C.white}05`, fontSize: 11, color: `${C.white}35`, borderRight: `1px solid ${C.border}`, flexShrink: 0, display: "flex", alignItems: "center" }}>jaayma.sn/</div>
            <input value={lien} onChange={e => hLien(e.target.value)} placeholder="mariama-mode" style={{ flex: 1, padding: "13px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: C.gold, fontWeight: 700, background: "transparent" }} />
          </div>
          {err && <div style={{ fontSize: 11, color: C.terra, marginTop: 5 }}>{err}</div>}
          {lien && !err && <div style={{ fontSize: 11, color: C.green, marginTop: 5 }}>✓ jaayma.sn/{lien}</div>}
        </div>
        <div style={{ background: `${C.green}0E`, borderRadius: 11, padding: "10px 14px", marginBottom: 20, marginTop: 14, border: `1px solid ${C.green}20` }}>
          <div style={{ fontSize: 12, color: `${C.green}CC`, lineHeight: 1.6 }}>📲 Notifications sur <strong>+221 {phone || "..."}</strong></div>
        </div>
        <Btn onClick={() => valid && onComplete({ phone, nom, lien })} disabled={!valid} style={{ width: "100%", justifyContent: "center", fontSize: 14, padding: "14px" }}>🚀 Créer ma boutique →</Btn>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: `${C.white}28` }}>Gratuit · Pas de carte bancaire requise</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   INSCRIPTION LIVREUR
════════════════════════════════════════════════════════ */
function InscriptionLivreur({ onComplete }) {
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [zone, setZone] = useState("");
  const zones = ["Dakar Plateau", "Médina", "Parcelles Assainies", "Guédiawaye", "Pikine", "Rufisque", "Thiès", "Autre"];
  const inp = { padding: "13px 16px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: C.white, width: "100%", boxSizing: "border-box", transition: "border-color .3s" };
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 360, height: 360, background: `${C.delivery}10`, top: -70, left: -60 }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.white, marginBottom: 30 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 440, border: `1px solid ${C.border}`, animation: "scaleIn .5s ease both" }}>
        <div style={{ width: 50, height: 50, borderRadius: 15, background: `${C.delivery}1A`, border: `1.5px solid ${C.delivery}38`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>🛵</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: C.white, marginBottom: 4, fontWeight: 700 }}>Espace Livreur</h2>
        <p style={{ color: `${C.white}45`, fontSize: 13, marginBottom: 24 }}>Inscris-toi pour recevoir des missions.</p>
        <div style={{ marginBottom: 13 }}><div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}42`, marginBottom: 7, letterSpacing: 1 }}>PRÉNOM ET NOM</div><input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Moussa Diallo" style={inp} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} /></div>
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}42`, marginBottom: 7, letterSpacing: 1 }}>NUMÉRO WHATSAPP</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "13px 14px", borderRadius: 12, background: `${C.white}08`, border: `1px solid ${C.border}`, fontSize: 13, color: `${C.white}60`, flexShrink: 0 }}>🇸🇳 +221</div>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="77 000 00 00" type="tel" style={{ ...inp, flex: 1 }} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}42`, marginBottom: 8, letterSpacing: 1 }}>ZONE DE LIVRAISON</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {zones.map(z => <button key={z} onClick={() => setZone(z)} style={{ padding: "9px 10px", borderRadius: 11, border: `1.5px solid ${zone === z ? C.delivery : C.border}`, background: zone === z ? `${C.delivery}1A` : `${C.white}04`, color: zone === z ? "#93C5FD" : `${C.white}48`, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .2s" }}>{z}</button>)}
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
function DashboardVendeur({ store, onPreview }) {
  const [tab, setTab] = useState("accueil");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: "", price: "", stock: "", image: "📦", image_url: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileRef = useRef(null);
  const marchandPhone = store?.phone || "";

  function st(m) { setToast(m); setTimeout(() => setToast(null), 3500); }

  async function loadData() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([db.getProduits(marchandPhone), db.getCommandes(marchandPhone)]);
      setProducts(p); setOrders(c);
    } catch (e) { st("❌ Erreur de chargement."); }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function addProduct() {
    if (!newP.name || !newP.price) return;
    setSaving(true);
    try {
      let image_url = null;
      if (imageFile) {
        image_url = await uploadImage(imageFile, marchandPhone);
      }
      const added = await db.addProduit({
        marchand_phone: marchandPhone,
        name: newP.name,
        price: parseInt(newP.price),
        stock: parseInt(newP.stock) || 0,
        image: imageFile ? "📷" : newP.image,
        image_url,
      });
      setProducts([added[0], ...products]);
      setNewP({ name: "", price: "", stock: "", image: "📦", image_url: "" });
      setImageFile(null); setImagePreview(null);
      setShowAdd(false);
      st("✅ Produit ajouté !");
    } catch (e) { st("❌ Erreur lors de l'ajout. Réessaie."); }
    setSaving(false);
  }

  async function deleteProduct(id) {
    try { await db.deleteProduit(id); setProducts(products.filter(p => p.id !== id)); st("🗑 Produit supprimé."); }
    catch (e) { st("❌ Erreur suppression."); }
  }

  async function assignerLivreur(orderId, livreurNom) {
    try { await db.updateCommande(orderId, { livreur: livreurNom, status: "assigné" }); setOrders(orders.map(o => o.id === orderId ? { ...o, livreur: livreurNom, status: "assigné" } : o)); st(`✅ ${livreurNom} assigné !`); setSel(null); }
    catch (e) { st("❌ Erreur."); }
  }

  async function envoyerMessage(orderId, message) {
    try { await db.updateCommande(orderId, { message, status: "en cours" }); setOrders(orders.map(o => o.id === orderId ? { ...o, message, status: "en cours" } : o)); st("📲 Message enregistré !"); setSel(null); }
    catch (e) { st("❌ Erreur."); }
  }

  const rev = orders.reduce((s, o) => s + (o.montant || 0), 0);
  const nbNew = orders.filter(o => o.status === "nouveau").length;
  const tabs = [{ id: "accueil", icon: "🏠", label: "Accueil" }, { id: "commandes", icon: "🛒", label: "Commandes" }, { id: "produits", icon: "📦", label: "Produits" }, { id: "boutique", icon: "👁", label: "Boutique" }];
  const inp = { width: "100%", padding: "12px 14px", borderRadius: 11, background: `${C.white}06`, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 10, transition: "border-color .3s" };

  const SidebarContent = () => (
    <>
      <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: C.white }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
      </div>
      <div style={{ padding: "16px 12px 0", flex: 1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMobileMenuOpen(false); if (t.id === "boutique") onPreview(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: tab === t.id ? `${C.terra}22` : "transparent", color: tab === t.id ? C.white : `${C.white}45`, fontSize: 13, fontWeight: tab === t.id ? 700 : 400, fontFamily: "'Outfit',sans-serif", marginBottom: 3, borderLeft: `3px solid ${tab === t.id ? C.terra : "transparent"}`, transition: "all .2s", textAlign: "left" }}>
            <span style={{ fontSize: 17 }}>{t.icon}</span>{t.label}
            {t.id === "commandes" && nbNew > 0 && <span style={{ marginLeft: "auto", background: C.terra, color: C.white, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 8px" }}>{nbNew}</span>}
          </button>
        ))}
      </div>
      <div style={{ padding: "0 12px 16px" }}>
        <div style={{ background: `${C.white}05`, borderRadius: 13, padding: 13, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.terra}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏪</div>
            <div><div style={{ fontSize: 12, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{store?.nom}</div><div style={{ fontSize: 10, color: C.green }}>● En ligne</div></div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex" }}>
      <style>{FONTS}{G}{`
        @media(max-width:768px){.desk-sidebar{display:none!important}.main-pad{padding:14px!important;padding-bottom:80px!important}}
        @media(min-width:769px){.bottom-nav{display:none!important}}
      `}</style>

      {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 3000, background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, color: C.white, borderRadius: 14, padding: "12px 18px", fontSize: 13, fontWeight: 600, border: `1px solid ${C.terra}44`, boxShadow: `0 8px 40px rgba(0,0,0,.5)`, animation: "scaleIn .3s ease both" }}>{toast}</div>}
      {sel && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}><OrderModal order={sel} onAssign={assignerLivreur} onMessage={envoyerMessage} onClose={() => setSel(null)} /></div>}
      {mobileMenuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1500 }}>
          <div onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: `linear-gradient(180deg,${C.charcoal},${C.obsidian})`, display: "flex", flexDirection: "column", padding: "24px 0", borderRight: `1px solid ${C.border}`, animation: "slideR .3s ease both" }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* SIDEBAR DESKTOP */}
      <div className="desk-sidebar" style={{ width: 220, background: `linear-gradient(180deg,${C.charcoal},${C.obsidian})`, flexShrink: 0, display: "flex", flexDirection: "column", padding: "24px 0", borderRight: `1px solid ${C.border}` }}>
        <SidebarContent />
      </div>

      {/* MAIN */}
      <div className="main-pad" style={{ flex: 1, overflow: "auto", padding: 28, paddingBottom: 80 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMobileMenuOpen(true)} style={{ background: `${C.white}08`, border: `1px solid ${C.border}`, borderRadius: 11, padding: "8px 12px", cursor: "pointer", fontSize: 18, color: C.white, display: "block" }} className="mobile-menu-btn">☰</button>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, fontWeight: 700, margin: 0 }}>
              {tab === "accueil" && "Bonjour 👋"}
              {tab === "commandes" && "Mes commandes"}
              {tab === "produits" && "Mes produits"}
            </h1>
          </div>
          <Btn variant="ghost" onClick={loadData} style={{ fontSize: 11, padding: "7px 14px" }}>↻ Actualiser</Btn>
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* ACCUEIL */}
            {tab === "accueil" && (
              <div>
                <div style={{ fontSize: 13, color: `${C.white}50`, marginBottom: 24 }}>{store?.nom} · jaayma.sn/{store?.lien}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
                  {[{ label: "Revenus", value: rev.toLocaleString() + " FCFA", icon: "💰", color: C.gold }, { label: "Commandes", value: orders.length, icon: "🛒", color: C.terra }, { label: "Nouvelles", value: nbNew, icon: "🔔", color: "#F59E0B" }, { label: "Produits", value: products.length, icon: "📦", color: "#22C55E" }].map((s, i) => (
                    <div key={i} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 16, padding: "18px 16px", border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: `${C.white}42`, marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 11, marginBottom: 24 }}>
                  {[{ icon: "➕", t: "Ajouter produit", s: "Avec photo réelle", action: () => setTab("produits"), c: C.terra }, { icon: "📋", t: "Voir commandes", s: nbNew > 0 ? `${nbNew} nouvelle(s)` : "Aucune nouvelle", action: () => setTab("commandes"), c: C.gold }, { icon: "👁", t: "Ma boutique", s: "Vue client", action: onPreview, c: C.delivery }].map((a, i) => (
                    <div key={i} onClick={a.action} style={{ background: `linear-gradient(135deg,${a.c}18,${a.c}08)`, borderRadius: 14, padding: "16px 18px", border: `1px solid ${a.c}28`, cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                      <div style={{ fontSize: 20, marginBottom: 7 }}>{a.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{a.t}</div>
                      <div style={{ fontSize: 11, color: `${C.white}48`, marginTop: 3 }}>{a.s}</div>
                    </div>
                  ))}
                </div>
                {orders.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}40`, letterSpacing: 2, marginBottom: 12 }}>DERNIÈRES COMMANDES</div>
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, marginBottom: 9, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", cursor: "pointer" }} onClick={() => { setTab("commandes"); setSel(o); }}>
                        <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{o.client_nom}</span><Badge status={o.status} /></div><div style={{ fontSize: 12, color: `${C.white}48` }}>{o.article}</div></div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: C.gold }}>{o.montant?.toLocaleString()} FCFA</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* COMMANDES */}
            {tab === "commandes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {orders.length === 0 && <div style={{ textAlign: "center", padding: 60, color: `${C.white}35` }}><div style={{ fontSize: 44, marginBottom: 14 }}>📭</div><div style={{ fontSize: 15, fontWeight: 600, color: `${C.white}55` }}>Aucune commande pour l'instant</div></div>}
                {orders.map(o => (
                  <div key={o.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}><span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{o.client_nom}</span><Badge status={o.status} /></div>
                      <div style={{ fontSize: 12, color: `${C.white}55` }}>{o.article}</div>
                      <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 11, color: `${C.white}35`, flexWrap: "wrap" }}>
                        <span>📱 {o.client_phone}</span><span>💳 {o.payment}</span>
                        {o.livreur && <span>🛵 {o.livreur}</span>}
                        <span>{new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: C.gold, marginBottom: 8 }}>{o.montant?.toLocaleString()} FCFA</div>
                      {(o.status === "nouveau" || o.status === "assigné") && <Btn onClick={() => setSel(o)} style={{ fontSize: 12, padding: "8px 14px" }}>Gérer →</Btn>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PRODUITS */}
            {tab === "produits" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Btn onClick={() => { setShowAdd(!showAdd); setImageFile(null); setImagePreview(null); }} style={{ fontSize: 13 }}>
                    {showAdd ? "✕ Annuler" : "📸 Nouveau produit"}
                  </Btn>
                </div>
                {showAdd && (
                  <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 22, marginBottom: 18, border: `1.5px solid ${C.terra}28`, animation: "scaleIn .3s ease both" }}>
                    <div style={{ fontWeight: 700, color: C.white, marginBottom: 16, fontSize: 15 }}>Nouveau produit</div>

                    {/* Zone upload photo */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: `${C.white}40`, marginBottom: 8, letterSpacing: 1 }}>PHOTO DU PRODUIT</div>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} />
                      {imagePreview ? (
                        <div style={{ position: "relative", marginBottom: 8 }}>
                          <img src={imagePreview} alt="" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 12 }} />
                          <button onClick={() => { setImageFile(null); setImagePreview(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: C.white, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                      ) : (
                        <div className="img-upload-zone" onClick={() => fileRef.current?.click()}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: `${C.white}70` }}>Appuie pour ajouter une photo</div>
                          <div style={{ fontSize: 11, color: `${C.white}38`, marginTop: 4 }}>Depuis ta galerie ou ton appareil photo</div>
                        </div>
                      )}
                    </div>

                    <input value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} placeholder="Nom du produit" style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 4 }}>
                      <input value={newP.price} onChange={e => setNewP({ ...newP, price: e.target.value })} placeholder="Prix (FCFA)" type="number" style={{ ...inp, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
                      <input value={newP.stock} onChange={e => setNewP({ ...newP, stock: e.target.value })} placeholder="Stock" type="number" style={{ ...inp, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
                    </div>
                    {!imageFile && (
                      <div style={{ marginBottom: 14, marginTop: 10 }}>
                        <div style={{ fontSize: 10, color: `${C.white}40`, marginBottom: 8 }}>OU CHOISIS UN EMOJI</div>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                          {["📦", "👗", "👠", "🧵", "🎨", "📿", "🌿", "💄", "🍎", "📱", "🧴", "👒"].map(e => (
                            <button key={e} onClick={() => setNewP({ ...newP, image: e })} style={{ width: 38, height: 38, borderRadius: 10, border: `2px solid ${newP.image === e ? C.terra : C.border}`, background: newP.image === e ? `${C.terra}22` : `${C.white}04`, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>
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
                  <div style={{ textAlign: "center", padding: 60, color: `${C.white}35` }}>
                    <div style={{ fontSize: 44, marginBottom: 14 }}>📦</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: `${C.white}55`, marginBottom: 20 }}>Aucun produit encore</div>
                    <Btn onClick={() => setShowAdd(true)}>📸 Ajouter un produit</Btn>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
                  {products.map(p => (
                    <div key={p.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, position: "relative" }}>
                      <button onClick={() => deleteProduct(p.id)} style={{ position: "absolute", top: 8, right: 8, zIndex: 2, background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", color: C.white, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      <ProductImage src={p.image_url} emoji={p.image} size={140} radius={0} />
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4, paddingRight: 24 }}>{p.name}</div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: C.gold, marginBottom: 3 }}>{p.price?.toLocaleString()} FCFA</div>
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

      {/* BOTTOM NAV MOBILE */}
      <div className="bottom-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.charcoal}F5`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 1000 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { if (t.id === "boutique") { onPreview(); } else { setTab(t.id); } }}
            style={{ flex: 1, padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: tab === t.id ? C.terra : `${C.white}40`, transition: "color .2s" }}>
            <span style={{ fontSize: 20, position: "relative" }}>
              {t.icon}
              {t.id === "commandes" && nbNew > 0 && <span style={{ position: "absolute", top: -4, right: -6, background: C.terra, color: C.white, borderRadius: "50%", width: 14, height: 14, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{nbNew}</span>}
            </span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 400, fontFamily: "'Outfit',sans-serif" }}>{t.label}</span>
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
  const [step, setStep] = useState("detail");
  const [msg, setMsg] = useState(`Salam ${order.client_nom} ! Merci pour votre commande.\n\nArticle : ${order.article}\nMontant : ${order.montant?.toLocaleString()} FCFA\nDélai : 2-3 heures\n\nNous vous contacterons à l'arrivée. Baraka !`);
  const [livreurInput, setLivreurInput] = useState("");
  return (
    <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 22, width: "100%", maxWidth: 460, maxHeight: "88vh", overflow: "auto", padding: 24, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.7)`, animation: "scaleIn .3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: C.white }}>Commande</div><div style={{ fontSize: 12, color: `${C.white}45` }}>{order.client_nom}</div></div>
        <button onClick={onClose} style={{ background: `${C.white}08`, border: `1px solid ${C.border}`, borderRadius: "50%", width: 30, height: 30, cursor: "pointer", fontSize: 14, color: `${C.white}70`, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      {step === "detail" && (<>
        <div style={{ background: `${C.white}04`, borderRadius: 13, padding: 15, marginBottom: 16, border: `1px solid ${C.border}` }}>
          {[["Client", order.client_nom], ["Téléphone", order.client_phone], ["Article", order.article], ["Montant", (order.montant?.toLocaleString() || 0) + " FCFA"], ["Adresse", order.client_adresse || "Non renseignée"], ["Paiement", order.payment]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: `${C.white}45`, fontWeight: 600 }}>{k}</span><span style={{ color: C.white, fontWeight: 600 }}>{v}</span>
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
        <input value={livreurInput} onChange={e => setLivreurInput(e.target.value)} placeholder="Ex : Moussa Diallo" style={{ width: "100%", padding: "12px 14px", borderRadius: 11, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 14 }} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px" }}>← Retour</Btn>
          <Btn variant="blue" onClick={() => livreurInput && onAssign(order.id, livreurInput)} disabled={!livreurInput} style={{ flex: 2, justifyContent: "center", fontSize: 13, padding: "11px" }}>✓ Confirmer</Btn>
        </div>
      </>)}
      {step === "message" && (<>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 4, fontSize: 14 }}>Message au client</div>
        <div style={{ fontSize: 11, color: `${C.white}40`, marginBottom: 11 }}>{order.client_nom} — {order.client_phone}</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 13, border: `1.5px solid ${C.border}`, fontSize: 12, fontFamily: "'Outfit',sans-serif", color: C.white, background: `${C.white}05`, minHeight: 140, resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, outline: "none" }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 9, marginTop: 11 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13, padding: "11px" }}>← Retour</Btn>
          <Btn onClick={() => onMessage(order.id, msg)} style={{ flex: 2, justifyContent: "center", fontSize: 13, padding: "11px" }}>📲 Enregistrer →</Btn>
        </div>
      </>)}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   BOUTIQUE CLIENT — DESIGN MODERNE SOMBRE
════════════════════════════════════════════════════════ */
function BoutiqueClient({ store, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("store");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({ nom: "", phone: "", adresse: "", payment: "" });
  const [submitting, setSubmitting] = useState(false);
  const marchandPhone = store?.phone || "";

  useEffect(() => {
    db.getProduits(marchandPhone).then(p => { setProducts(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function addToCart(p, qty = 1) {
    setCart(prev => { const e = prev.find(i => i.id === p.id); return e ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + qty } : i) : [...prev, { ...p, qty }]; });
  }
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
    } catch (e) { alert("Erreur. Réessaie."); }
    setSubmitting(false);
  }

  const inp = { width: "100%", padding: "13px 15px", borderRadius: 12, background: `${C.white}07`, border: `1.5px solid ${C.border}`, outline: "none", fontSize: 13, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 10, transition: "border-color .3s" };

  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      <style>{FONTS}{G}</style>

      {/* HEADER BOUTIQUE */}
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, padding: "16px 16px 0", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, paddingBottom: 16 }}>
          <button onClick={onBack} style={{ background: `${C.white}07`, border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: `${C.white}70`, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>← Retour</button>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.terra}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🏪</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 17, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store?.nom}</div>
            <div style={{ fontSize: 10, color: `${C.white}38` }}>jaayma.sn/{store?.lien}</div>
          </div>
          {count > 0 && (
            <button onClick={() => setView("cart")} style={{ background: `linear-gradient(135deg,${C.terra},${C.terr2})`, border: "none", borderRadius: 12, padding: "7px 14px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: C.white, flexShrink: 0, position: "relative" }}>
              🛒 {count}
            </button>
          )}
        </div>
      </div>

      {/* VUE PRODUIT DÉTAIL */}
      {selectedProduct && view === "store" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: C.obsidian, maxWidth: 480, margin: "0 auto", overflow: "auto", animation: "pageIn .3s ease both" }}>
          <div style={{ position: "sticky", top: 0, background: `${C.charcoal}F0`, backdropFilter: "blur(20px)", padding: "16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSelectedProduct(null)} style={{ background: `${C.white}07`, border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: `${C.white}70`, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>← Retour</button>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{selectedProduct.name}</span>
          </div>
          <ProductImage src={selectedProduct.image_url} emoji={selectedProduct.image} size={280} radius={0} />
          <div style={{ padding: 20 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 6 }}>{selectedProduct.name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.gold, marginBottom: 16 }}>{selectedProduct.price?.toLocaleString()} <span style={{ fontSize: 16 }}>FCFA</span></div>
            <div style={{ fontSize: 12, color: selectedProduct.stock > 0 ? "#4ADE80" : "#EF4444", fontWeight: 600, marginBottom: 24 }}>
              {selectedProduct.stock > 0 ? `✓ En stock (${selectedProduct.stock} disponibles)` : "✗ Rupture de stock"}
            </div>
            {selectedProduct.stock > 0 && (
              <Btn onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "16px" }}>
                Ajouter au panier →
              </Btn>
            )}
          </div>
        </div>
      )}

      {/* VUE PRINCIPALE BOUTIQUE */}
      {view === "store" && !selectedProduct && (
        <div style={{ padding: "16px 14px" }}>
          {loading ? <Spinner /> : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: `${C.white}40` }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🏪</div>
              <div style={{ fontSize: 14 }}>Cette boutique n'a pas encore de produits.</div>
            </div>
          ) : (
            <>
              {/* Bannière boutique */}
              <div style={{ background: `linear-gradient(135deg,${C.terra}22,${C.gold}0A)`, borderRadius: 16, padding: "20px 18px", marginBottom: 20, border: `1px solid ${C.terra}28`, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${C.terra}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏪</div>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.white }}>{store?.nom}</div>
                  <div style={{ fontSize: 12, color: `${C.white}55`, marginTop: 2 }}>{products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}</div>
                </div>
              </div>

              {/* Grille produits */}
              <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}40`, letterSpacing: 2, marginBottom: 14 }}>NOS PRODUITS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {products.map(p => (
                  <div key={p.id} onClick={() => setSelectedProduct(p)} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, cursor: "pointer" }}>
                    <ProductImage src={p.image_url} emoji={p.image} size={130} radius={0} />
                    <div style={{ padding: "10px 12px 12px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 8 }}>{p.price?.toLocaleString()} <span style={{ fontSize: 10 }}>FCFA</span></div>
                      {p.stock > 0 ? (
                        <button onClick={e => { e.stopPropagation(); addToCart(p); }} style={{ width: "100%", padding: "8px", borderRadius: 9, border: "none", background: `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>+ Ajouter</button>
                      ) : (
                        <div style={{ textAlign: "center", padding: "7px", fontSize: 11, color: `${C.white}30`, background: `${C.white}05`, borderRadius: 9 }}>Rupture</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modes de paiement */}
              <div style={{ marginTop: 20, padding: "14px 16px", background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 14, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: `${C.white}35`, marginBottom: 10, fontWeight: 700, letterSpacing: 1 }}>PAIEMENTS ACCEPTÉS</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["📱 Wave", "🟠 Orange Money", "🚚 À la livraison"].map(m => (
                    <span key={m} style={{ background: `${C.white}07`, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: `${C.white}65`, border: `1px solid ${C.border}` }}>{m}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* PANIER */}
      {view === "cart" && (
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setView("store")} style={{ background: `${C.white}07`, border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: `${C.white}70`, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>← Retour</button>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: C.white, fontWeight: 700 }}>Mon panier</h3>
          </div>
          {cart.map(item => (
            <div key={item.id} style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 14, marginBottom: 10, border: `1px solid ${C.border}`, display: "flex", overflow: "hidden" }}>
              <div style={{ width: 80, flexShrink: 0 }}>
                <ProductImage src={item.image_url} emoji={item.image} size={80} radius={0} />
              </div>
              <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{item.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: C.gold }}>{(item.price * item.qty).toLocaleString()} FCFA</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: `${C.white}07`, border: `1px solid ${C.border}`, cursor: "pointer", color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${C.terra},${C.terr2})`, border: "none", cursor: "pointer", color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: `${C.white}40`, cursor: "pointer", fontSize: 13 }}>Suppr.</button>
                </div>
              </div>
            </div>
          ))}

          {/* Résumé */}
          <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 14, padding: "16px 18px", marginTop: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: `${C.white}60` }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.gold }}>{total.toLocaleString()} FCFA</span>
            </div>
            <button onClick={() => setView("checkout")} style={{ width: "100%", padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 20px ${C.terra}44` }}>
              Commander — {total.toLocaleString()} FCFA →
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT */}
      {view === "checkout" && (
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setView("cart")} style={{ background: `${C.white}07`, border: `1px solid ${C.border}`, borderRadius: 11, padding: "7px 12px", color: `${C.white}70`, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>← Retour</button>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: C.white, fontWeight: 700 }}>Finaliser</h3>
          </div>

          {/* Résumé commande */}
          <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 14, padding: "14px 16px", marginBottom: 20, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: `${C.white}40`, letterSpacing: 1, marginBottom: 10 }}>RÉSUMÉ</div>
            {cart.map(i => (
              <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: `${C.white}70`, marginBottom: 6 }}>
                <span>{i.name} × {i.qty}</span>
                <span style={{ color: C.white }}>{(i.price * i.qty).toLocaleString()} FCFA</span>
              </div>
            ))}
            <div style={{ height: 1, background: C.border, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: C.gold }}>{total.toLocaleString()} FCFA</span>
            </div>
          </div>

          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom complet" style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone WhatsApp" style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.adresse || ""} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Adresse de livraison" style={{ ...inp, marginBottom: 18 }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}40`, marginBottom: 10, letterSpacing: 1 }}>MODE DE PAIEMENT</div>
            {["📱 Wave", "🟠 Orange Money", "🚚 Paiement à la livraison"].map(m => (
              <button key={m} onClick={() => setForm({ ...form, payment: m })} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 15px", marginBottom: 8, borderRadius: 13, border: `1.5px solid ${form.payment === m ? C.terra : C.border}`, background: form.payment === m ? `${C.terra}15` : `${C.white}04`, color: form.payment === m ? C.terra : `${C.white}55`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textAlign: "left", transition: "all .2s" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.payment === m ? C.terra : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {form.payment === m && <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.terra, display: "block" }} />}
                </span>
                {m}
              </button>
            ))}
          </div>

          <button disabled={!form.nom || !form.phone || !form.payment || submitting} onClick={confirmerCommande}
            style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: !form.nom || !form.phone || !form.payment ? `${C.white}0C` : `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .3s", boxShadow: form.nom && form.phone && form.payment ? `0 4px 20px ${C.terra}44` : "none" }}>
            {submitting ? "⏳ Enregistrement..." : "✓ Confirmer la commande"}
          </button>
        </div>
      )}

      {/* CONFIRMATION */}
      {view === "confirmed" && (
        <div style={{ padding: 36, textAlign: "center", animation: "scaleIn .5s ease both" }}>
          <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🎉</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, marginBottom: 12, fontWeight: 700 }}>Commande confirmée !</h2>
          <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, marginBottom: 22, textAlign: "left", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}38`, marginBottom: 13, letterSpacing: 1 }}>VOUS ALLEZ RECEVOIR</div>
            {["📲 Un message WhatsApp du vendeur", "🛵 Notification quand le livreur arrive", "✅ Confirmation à la livraison"].map(s => (
              <div key={s} style={{ fontSize: 13, color: `${C.white}65`, marginBottom: 8, display: "flex", gap: 9 }}><span style={{ color: C.green }}>✓</span>{s.split(" ").slice(1).join(" ")}</div>
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
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh" }}>
      <style>{FONTS}{G}</style>
      <div style={{ background: `linear-gradient(135deg,${C.delivery},#1D4ED8)`, padding: "20px 20px 24px", display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${C.white}1E`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛵</div>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 20, color: C.white }}>Jaayma Livreur</div><div style={{ fontSize: 12, color: `${C.white}BB` }}>{livreur?.nom} · {livreur?.zone}</div></div>
        <div style={{ marginLeft: "auto", background: `${C.white}1A`, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: C.white }}>● Disponible</div>
      </div>
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>🛵</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 8 }}>Bienvenue {livreur?.nom} !</div>
        <div style={{ fontSize: 13, color: `${C.white}48` }}>Les missions te seront assignées par les vendeurs.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   APP ROOT
════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [storeData, setStoreData] = useState(null);
  const [livreurData, setLivreurData] = useState(null);
  return (
    <>
      {screen === "landing" && <Landing onVendeur={() => setScreen("inscription-vendeur")} onLivreur={() => setScreen("inscription-livreur")} />}
      {screen === "inscription-vendeur" && <InscriptionVendeur onComplete={d => { setStoreData(d); setScreen("dashboard-vendeur"); }} />}
      {screen === "inscription-livreur" && <InscriptionLivreur onComplete={d => { setLivreurData(d); setScreen("dashboard-livreur"); }} />}
      {screen === "dashboard-vendeur" && <DashboardVendeur store={storeData} onPreview={() => setScreen("boutique-client")} />}
      {screen === "dashboard-livreur" && <DashboardLivreur livreur={livreurData} />}
      {screen === "boutique-client" && <BoutiqueClient store={storeData} onBack={() => setScreen("dashboard-vendeur")} />}
    </>
  );
}
