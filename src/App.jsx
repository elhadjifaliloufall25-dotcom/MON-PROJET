import { useState, useEffect, useRef } from "react";

/* ── SUPABASE ────────────────────────────────────────── */
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
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const db = {
  // Produits
  getProduits: (marchandPhone) =>
    supaFetch(`produits?marchand_phone=eq.${encodeURIComponent(marchandPhone)}&order=created_at.desc`),
  addProduit: (produit) =>
    supaFetch("produits", { method: "POST", body: JSON.stringify(produit) }),
  deleteProduit: (id) =>
    supaFetch(`produits?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" }),

  // Commandes
  getCommandes: (marchandPhone) =>
    supaFetch(`commandes?marchand_phone=eq.${encodeURIComponent(marchandPhone)}&order=created_at.desc`),
  addCommande: (commande) =>
    supaFetch("commandes", { method: "POST", body: JSON.stringify(commande) }),
  updateCommande: (id, updates) =>
    supaFetch(`commandes?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(updates), prefer: "return=minimal" }),

  // Produits publics d'une boutique
  getProduitsPublics: (marchandPhone) =>
    supaFetch(`produits?marchand_phone=eq.${encodeURIComponent(marchandPhone)}&order=created_at.desc`),
};

/* ── PALETTE ─────────────────────────────────────────── */
const C = {
  obsidian: "#0A0705", charcoal: "#141010", ember: "#1E1510",
  terra: "#C4572A", terr2: "#E06535", gold: "#E8A020", gold2: "#F5C842",
  green: "#1A7A4A", white: "#FFFFFF", gray: "#8C7B6E",
  border: "#2A1F18", mid: "#5C3D2E", delivery: "#2563EB", sand: "#D4A574",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');`;

const G = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:${C.obsidian};overflow-x:hidden}
::selection{background:${C.terra}44;color:${C.gold}}
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
@keyframes pageIn{from{opacity:0;transform:translateX(50px) scale(0.98)}to{opacity:1;transform:translateX(0) scale(1)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.reveal{opacity:0;transform:translateY(32px);transition:opacity .65s ease,transform .65s ease}
.reveal.on{opacity:1;transform:translateY(0)}
.rl{opacity:0;transform:translateX(-28px);transition:opacity .65s ease,transform .65s ease}
.rl.on{opacity:1;transform:translateX(0)}
.rs{opacity:0;transform:scale(0.9);transition:opacity .55s ease,transform .55s ease}
.rs.on{opacity:1;transform:scale(1)}
.mag{transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s ease}
.mag:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 12px 40px ${C.terra}44}
.mag:active{transform:translateY(-1px) scale(0.99)}
.ch{transition:transform .3s cubic-bezier(.34,1.2,.64,1),box-shadow .3s ease,border-color .3s ease}
.ch:hover{transform:translateY(-5px);box-shadow:0 18px 50px rgba(196,87,42,.18);border-color:${C.terra}55!important}
.gs{background:linear-gradient(90deg,${C.gold},${C.gold2},${C.sand},${C.gold});background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
.page{animation:pageIn .5s cubic-bezier(.34,.8,.64,1) both}
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:float 6s ease-in-out infinite}
.stepline::before{content:'';position:absolute;left:21px;top:46px;width:2px;height:calc(100% - 18px);background:linear-gradient(to bottom,${C.terra}55,transparent)}
.spinner{width:36px;height:36px;border:3px solid ${C.border};border-top:3px solid ${C.terra};border-radius:50%;animation:spin .8s linear infinite}
@media(max-width:768px){
  .hl{flex-direction:column!important}
  .hv{display:none!important}
  .pg{grid-template-columns:1fr!important}
  .pf{transform:none!important}
  .ds{display:none!important}
  .hb{flex-direction:column!important}
  .hb button{width:100%!important}
  .sb{gap:20px!important}
}
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.rl,.rs');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    els.forEach((el, i) => { el.style.transitionDelay = `${(i % 5) * 0.09}s`; obs.observe(el); });
    return () => obs.disconnect();
  });
}

function AnimNum({ n, suf = "" }) {
  const [v, setV] = useState(0);
  const r = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const num = parseInt(String(n).replace(/\D/g, '')) || 0;
      let cur = 0; const inc = num / 60;
      const t = setInterval(() => { cur += inc; if (cur >= num) { setV(num); clearInterval(t); } else setV(Math.floor(cur)); }, 25);
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
    red: { background: `linear-gradient(135deg,#DC2626,#EF4444)`, color: C.white, padding: "10px 20px", fontSize: 13 },
  };
  return <button onClick={disabled ? undefined : onClick} className="mag" style={{ ...base, ...v[variant], ...style }}>{children}</button>;
}

function Spinner() {
  return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div className="spinner" /></div>;
}

/* ── LANDING ─────────────────────────────────────────── */
function Landing({ onVendeur, onLivreur }) {
  useReveal();
  const [nav, setNav] = useState(false);
  const bg = useRef(null);
  useEffect(() => {
    const h = () => { setNav(window.scrollY > 40); if (bg.current) bg.current.style.transform = `translateY(${window.scrollY * 0.18}px)`; };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{FONTS}{G}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: "0 6%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: nav ? `${C.obsidian}F0` : "transparent", backdropFilter: nav ? "blur(20px)" : "none", borderBottom: nav ? `1px solid ${C.border}` : "none", transition: "all .4s ease", animation: "fadeIn .8s ease both" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: 1 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onLivreur} style={{ fontSize: 13, padding: "8px 16px" }}>🛵 Livreur</Btn>
          <Btn onClick={onVendeur} style={{ fontSize: 13, padding: "10px 20px" }}>Créer ma boutique</Btn>
        </div>
      </nav>

      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", padding: "100px 6% 60px", overflow: "hidden" }}>
        <div className="orb" style={{ width: 600, height: 600, background: `${C.terra}1A`, top: -120, right: -120 }} />
        <div className="orb" style={{ width: 400, height: 400, background: `${C.gold}0F`, bottom: -60, left: "18%", animationDelay: "2s" }} />
        <div ref={bg} style={{ position: "absolute", inset: 0, opacity: 0.035, backgroundImage: `repeating-linear-gradient(45deg,${C.gold} 0,${C.gold} 1px,transparent 0,transparent 50%)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div className="hl" style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 80 }}>
          <div style={{ flex: 1 }}>
            <div style={{ animation: "slideR .8s ease both .1s" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${C.gold}15`, borderRadius: 100, padding: "7px 18px", marginBottom: 28, border: `1px solid ${C.gold}28` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1 }}>🇸🇳 LA PLATEFORME E-COMMERCE DU SÉNÉGAL</span>
              </div>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,6vw,74px)", lineHeight: 1.06, fontWeight: 700, color: C.white, marginBottom: 6, animation: "fadeUp .9s ease both .2s" }}>Vends en ligne.</h1>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,6vw,74px)", lineHeight: 1.06, fontWeight: 700, marginBottom: 6, animation: "fadeUp .9s ease both .33s" }}><span className="gs">En 3 minutes.</span></h1>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(40px,6vw,74px)", lineHeight: 1.06, fontWeight: 300, fontStyle: "italic", color: `${C.white}55`, marginBottom: 30, animation: "fadeUp .9s ease both .46s" }}>Sans agence.</h1>
            <p style={{ fontSize: 16, color: `${C.white}68`, lineHeight: 1.9, marginBottom: 38, maxWidth: 480, animation: "fadeUp .9s ease both .56s" }}>Crée ta boutique, reçois tes commandes sur WhatsApp, et coordonne tes livreurs — tout depuis un seul endroit.</p>
            <div className="hb" style={{ display: "flex", gap: 12, animation: "fadeUp .9s ease both .66s" }}>
              <Btn onClick={onVendeur} style={{ fontSize: 15, padding: "16px 32px" }}>🚀 Créer ma boutique — Gratuit</Btn>
              <Btn variant="ghost" onClick={onLivreur} style={{ fontSize: 15, padding: "16px 28px" }}>🛵 Espace livreur</Btn>
            </div>
            <div className="sb" style={{ display: "flex", gap: 40, marginTop: 48, paddingTop: 36, borderTop: `1px solid ${C.border}`, animation: "fadeUp .9s ease both .8s" }}>
              {[["2300", "+", "boutiques actives"], ["98", "%", "satisfaction"], ["0", " FCFA", "pour démarrer"]].map(([n, s, l]) => (
                <div key={l}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: C.terra, lineHeight: 1 }}><AnimNum n={n} />{s}</div><div style={{ fontSize: 11, color: `${C.white}40`, marginTop: 4 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hv" style={{ width: 360, flexShrink: 0 }}>
            <div style={{ background: `linear-gradient(160deg,${C.charcoal},${C.ember})`, borderRadius: 28, padding: 28, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.6)`, animation: "scaleIn 1s ease both .5s" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}35`, letterSpacing: 2, marginBottom: 22 }}>COMMENT ÇA MARCHE</div>
              {[{ icon: "👤", color: "#7C3AED", title: "Client commande", sub: "Paie via Wave ou Orange Money" }, { icon: "📲", color: C.terra, title: "Vendeur notifié", sub: "WhatsApp instantané" }, { icon: "🛵", color: C.delivery, title: "Livreur assigné", sub: "Reçoit l'adresse en temps réel" }, { icon: "✅", color: C.green, title: "Livraison confirmée", sub: "Client reçoit la confirmation" }].map((s, i) => (
                <div key={i} className={i < 3 ? "stepline" : ""} style={{ position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", animation: `slideR .6s ease both ${.7 + i * .12}s` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `${s.color}1E`, border: `1.5px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, zIndex: 1, position: "relative" }}>{s.icon}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{s.title}</div><div style={{ fontSize: 12, color: `${C.white}48`, marginTop: 2 }}>{s.sub}</div></div>
                    <div style={{ marginLeft: "auto", color: s.color, fontSize: 18, opacity: 0.55 }}>→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "90px 6%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.terra, letterSpacing: 3, marginBottom: 14 }}>TOUT CE DONT TU AS BESOIN</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 700, color: C.white }}>Une plateforme. <span className="gs">Toutes les fonctions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {[{ icon: "🏪", title: "Boutique en 3 min", desc: "Catalogue, lien personnalisé. Aucun code requis.", color: C.terra }, { icon: "📲", title: "Notifs WhatsApp", desc: "Chaque commande arrive direct sur ton WhatsApp.", color: C.gold }, { icon: "💳", title: "Wave & Orange Money", desc: "Paiements intégrés. Tes clients paient en un clic.", color: "#22C55E" }, { icon: "🛵", title: "Réseau livreurs", desc: "Assigne les commandes aux livreurs de ta zone.", color: C.delivery }].map((f, i) => (
              <div key={i} className="reveal ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 22, padding: 26, border: `1px solid ${C.border}`, cursor: "default", transitionDelay: `${i * .09}s` }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: `${f.color}1E`, border: `1.5px solid ${f.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 700, color: C.white, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: `${C.white}58`, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "90px 6%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,${C.terra}10 0%,transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.terra, letterSpacing: 3, marginBottom: 14 }}>TARIFS</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 700, color: C.white }}>Des prix <span className="gs">honnêtes</span></h2>
          </div>
          <div className="pg" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, alignItems: "center" }}>
            {[{ name: "Démarrage", price: "Gratuit", sub: "", features: ["1 boutique", "10 produits", "Notifs WhatsApp", "Lien personnalisé"], feat: false }, { name: "Commerçant", price: "4 900", sub: "FCFA/mois", features: ["Produits illimités", "Livreurs intégrés", "Wave + Orange Money", "Stats avancées", "Domaine .sn"], feat: true }, { name: "Business", price: "14 900", sub: "FCFA/mois", features: ["Multi-boutiques", "API livreurs", "Support prioritaire", "Facturation auto"], feat: false }].map((p, i) => (
              <div key={i} className={`reveal ch ${p.feat ? "pf" : ""}`} style={{ background: p.feat ? `linear-gradient(160deg,${C.terra},#9A3A18)` : `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 22, padding: p.feat ? 30 : 24, border: `1px solid ${p.feat ? C.terra + "88" : C.border}`, transform: p.feat ? "scale(1.04)" : "none", boxShadow: p.feat ? `0 28px 70px ${C.terra}44` : "none", position: "relative", overflow: "hidden", transitionDelay: `${i * .09}s` }}>
                {p.feat && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(90deg,${C.gold},${C.gold2})`, color: C.obsidian, fontSize: 10, fontWeight: 800, padding: "4px 16px", borderRadius: "0 0 10px 10px", letterSpacing: 1 }}>★ LE PLUS POPULAIRE</div>}
                <div style={{ fontSize: 11, fontWeight: 700, color: p.feat ? `${C.white}AA` : `${C.white}45`, letterSpacing: 2, marginBottom: 8 }}>{p.name.toUpperCase()}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: p.price === "Gratuit" ? 34 : 40, fontWeight: 700, color: C.white, lineHeight: 1 }}>{p.price === "Gratuit" ? "Gratuit" : <>{p.price} <span style={{ fontSize: 14, fontWeight: 400, color: `${C.white}70` }}>{p.sub}</span></>}</div>
                <div style={{ height: 1, background: p.feat ? `${C.white}1E` : C.border, margin: "18px 0" }} />
                {p.features.map(f => (<div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 9 }}><span style={{ color: p.feat ? C.gold : C.terra, fontSize: 13 }}>✓</span><span style={{ fontSize: 13, color: p.feat ? C.white : `${C.white}70` }}>{f}</span></div>))}
                <div style={{ marginTop: 22 }}><Btn onClick={onVendeur} variant={p.feat ? "gold" : "ghost"} style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>{p.feat ? "Commencer maintenant →" : "Choisir"}</Btn></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal" style={{ padding: "70px 6% 110px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 30, padding: "56px 44px", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: `${C.terra}1E`, filter: "blur(50px)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,4vw,42px)", fontWeight: 700, color: C.white, marginBottom: 14 }}>Prêt à vendre en ligne ?</div>
          <p style={{ fontSize: 15, color: `${C.white}58`, marginBottom: 34, lineHeight: 1.8 }}>Rejoins 2 300+ commerçants sénégalais qui font confiance à Jaayma.</p>
          <Btn onClick={onVendeur} style={{ fontSize: 16, padding: "18px 40px" }}>🚀 Créer ma boutique gratuitement</Btn>
        </div>
      </section>
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "28px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: C.white }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
        <div style={{ fontSize: 12, color: `${C.white}30` }}>© 2026 Jaayma — La plateforme e-commerce du Sénégal 🇸🇳</div>
      </footer>
    </div>
  );
}

/* ── INSCRIPTION VENDEUR ─────────────────────────────── */
function InscriptionVendeur({ onComplete }) {
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [lien, setLien] = useState(""); const [lienError, setLienError] = useState("");
  function hNom(v) { setNom(v); setLien(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }
  function hLien(v) { const c = v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""); setLien(c); setLienError(c.length < 3 ? "Minimum 3 caractères" : ""); }
  const valid = phone.length >= 9 && nom.length >= 2 && lien.length >= 3;
  const inp = { width: "100%", padding: "13px 16px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", transition: "border-color .3s" };
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 500, height: 500, background: `${C.terra}14`, top: -100, right: -100 }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, color: C.white, marginBottom: 34, letterSpacing: 1 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 26, padding: 38, width: "100%", maxWidth: 450, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.5)`, animation: "scaleIn .5s ease both" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, marginBottom: 5, fontWeight: 700 }}>Crée ta boutique</h2>
        <p style={{ color: `${C.white}48`, fontSize: 14, marginBottom: 30 }}>3 informations, c'est tout. 🚀</p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 7, letterSpacing: 1 }}>NUMÉRO WHATSAPP</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "13px 15px", borderRadius: 12, background: `${C.white}08`, border: `1px solid ${C.border}`, fontSize: 13, color: `${C.white}65`, flexShrink: 0 }}>🇸🇳 +221</div>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="77 000 00 00" type="tel" maxLength={9} style={{ ...inp, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 7, letterSpacing: 1 }}>NOM DE TA BOUTIQUE</div>
          <input value={nom} onChange={e => hNom(e.target.value)} placeholder="Ex : Mariama Mode..." style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 7, letterSpacing: 1 }}>TON LIEN PERSONNALISÉ</div>
          <div style={{ display: "flex", borderRadius: 12, border: `1px solid ${lienError ? C.terra : C.border}`, overflow: "hidden", background: `${C.white}06` }}>
            <div style={{ padding: "13px 13px", background: `${C.white}05`, fontSize: 12, color: `${C.white}38`, borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>jaayma.sn/</div>
            <input value={lien} onChange={e => hLien(e.target.value)} placeholder="mariama-mode" style={{ flex: 1, padding: "13px 13px", border: "none", outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.gold, fontWeight: 700, background: "transparent" }} />
          </div>
          {lienError && <div style={{ fontSize: 11, color: C.terra, marginTop: 5 }}>{lienError}</div>}
          {lien && !lienError && <div style={{ fontSize: 11, color: C.green, marginTop: 5 }}>✓ jaayma.sn/{lien}</div>}
        </div>
        <div style={{ background: `${C.green}10`, borderRadius: 12, padding: "11px 15px", marginBottom: 22, marginTop: 14, border: `1px solid ${C.green}22` }}>
          <div style={{ fontSize: 12, color: `${C.green}CC`, lineHeight: 1.6 }}>📲 Notifications sur <strong>+221 {phone || "..."}</strong></div>
        </div>
        <Btn onClick={() => valid && onComplete({ phone, nom, lien })} disabled={!valid} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "15px" }}>🚀 Créer ma boutique →</Btn>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: `${C.white}30` }}>Gratuit · Pas de carte bancaire requise</div>
      </div>
    </div>
  );
}

/* ── INSCRIPTION LIVREUR ─────────────────────────────── */
function InscriptionLivreur({ onComplete }) {
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [zone, setZone] = useState("");
  const zones = ["Dakar Plateau", "Médina", "Parcelles Assainies", "Guédiawaye", "Pikine", "Rufisque", "Thiès", "Autre"];
  const inp = { padding: "13px 16px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.white, width: "100%", boxSizing: "border-box", transition: "border-color .3s" };
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 380, height: 380, background: `${C.delivery}12`, top: -80, left: -70 }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, color: C.white, marginBottom: 34 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 26, padding: 38, width: "100%", maxWidth: 450, border: `1px solid ${C.border}`, animation: "scaleIn .5s ease both" }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: `${C.delivery}1E`, border: `1.5px solid ${C.delivery}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>🛵</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, marginBottom: 5, fontWeight: 700 }}>Espace Livreur</h2>
        <p style={{ color: `${C.white}48`, fontSize: 14, marginBottom: 26 }}>Inscris-toi pour recevoir des missions.</p>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 7, letterSpacing: 1 }}>PRÉNOM ET NOM</div><input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Moussa Diallo" style={inp} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} /></div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 7, letterSpacing: 1 }}>NUMÉRO WHATSAPP</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "13px 15px", borderRadius: 12, background: `${C.white}08`, border: `1px solid ${C.border}`, fontSize: 13, color: `${C.white}65`, flexShrink: 0 }}>🇸🇳 +221</div>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} placeholder="77 000 00 00" type="tel" style={{ ...inp, marginBottom: 0 }} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
        </div>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 9, letterSpacing: 1 }}>ZONE DE LIVRAISON</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {zones.map(z => <button key={z} onClick={() => setZone(z)} style={{ padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${zone === z ? C.delivery : C.border}`, background: zone === z ? `${C.delivery}1E` : `${C.white}04`, color: zone === z ? "#93C5FD" : `${C.white}50`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .2s" }}>{z}</button>)}
          </div>
        </div>
        <Btn variant="blue" onClick={() => nom && phone && zone && onComplete({ nom, phone, zone })} disabled={!nom || !phone || !zone} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "15px" }}>🛵 Rejoindre Jaayma →</Btn>
      </div>
    </div>
  );
}

/* ── DASHBOARD VENDEUR (SUPABASE RÉEL) ───────────────── */
function DashboardVendeur({ store, onPreview }) {
  const [tab, setTab] = useState("commandes");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: "", price: "", stock: "", image: "📦" });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const marchandPhone = `+221${store?.phone}`;

  function st(m) { setToast(m); setTimeout(() => setToast(null), 3500); }

  async function loadData() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        db.getProduits(marchandPhone),
        db.getCommandes(marchandPhone),
      ]);
      setProducts(p);
      setOrders(c);
    } catch (e) {
      st("❌ Erreur de chargement. Vérifie ta connexion.");
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function addProduct() {
    if (!newP.name || !newP.price) return;
    setSaving(true);
    try {
      const added = await db.addProduit({
        marchand_phone: marchandPhone,
        name: newP.name,
        price: parseInt(newP.price),
        stock: parseInt(newP.stock) || 0,
        image: newP.image,
      });
      setProducts([added[0], ...products]);
      setNewP({ name: "", price: "", stock: "", image: "📦" });
      setShowAdd(false);
      st("✅ Produit ajouté !");
    } catch (e) {
      st("❌ Erreur lors de l'ajout.");
    }
    setSaving(false);
  }

  async function deleteProduct(id) {
    try {
      await db.deleteProduit(id);
      setProducts(products.filter(p => p.id !== id));
      st("🗑 Produit supprimé.");
    } catch (e) {
      st("❌ Erreur suppression.");
    }
  }

  async function assignerLivreur(orderId, livreurNom) {
    try {
      await db.updateCommande(orderId, { livreur: livreurNom, status: "assigné" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, livreur: livreurNom, status: "assigné" } : o));
      st(`✅ ${livreurNom} assigné !`);
      setSel(null);
    } catch (e) { st("❌ Erreur."); }
  }

  async function envoyerMessage(orderId, message) {
    try {
      await db.updateCommande(orderId, { message, status: "en cours" });
      setOrders(orders.map(o => o.id === orderId ? { ...o, message, status: "en cours" } : o));
      st("📲 Message enregistré !");
      setSel(null);
    } catch (e) { st("❌ Erreur."); }
  }

  const rev = orders.reduce((s, o) => s + o.montant, 0);
  const tabs = [{ id: "commandes", l: "🛒 Commandes" }, { id: "produits", l: "📦 Produits" }];
  const inp = { width: "100%", padding: "12px 15px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, fontSize: 14, outline: "none", fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 11, transition: "border-color .3s" };

  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex" }}>
      <style>{FONTS}{G}</style>
      {toast && <div style={{ position: "fixed", top: 22, right: 22, zIndex: 1000, background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, color: C.white, borderRadius: 16, padding: "13px 20px", fontSize: 13, fontWeight: 600, border: `1px solid ${C.terra}44`, boxShadow: `0 8px 40px rgba(0,0,0,.5)`, animation: "scaleIn .3s ease both" }}>{toast}</div>}
      {sel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <OrderModal order={sel} onAssign={assignerLivreur} onMessage={envoyerMessage} onClose={() => setSel(null)} />
        </div>
      )}

      {/* Sidebar */}
      <div className="ds" style={{ width: 236, background: `linear-gradient(180deg,${C.charcoal},${C.obsidian})`, flexShrink: 0, display: "flex", flexDirection: "column", padding: "26px 0", borderRight: `1px solid ${C.border}` }}>
        <div style={{ padding: "0 22px 22px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 25, fontWeight: 700, color: C.white }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
        </div>
        <div style={{ padding: "18px 14px 0" }}>
          <div style={{ background: `linear-gradient(135deg,${C.terra}20,${C.gold}0D)`, borderRadius: 16, padding: 16, marginBottom: 18, border: `1px solid ${C.terra}28` }}>
            <div style={{ fontSize: 10, color: `${C.white}40`, marginBottom: 5, letterSpacing: 2 }}>REVENUS TOTAUX</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: C.gold }}>{rev.toLocaleString()} <span style={{ fontSize: 12, color: `${C.gold}75` }}>FCFA</span></div>
          </div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: tab === t.id ? `${C.terra}22` : "transparent", color: tab === t.id ? C.white : `${C.white}48`, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, fontFamily: "'Outfit',sans-serif", marginBottom: 3, borderLeft: `3px solid ${tab === t.id ? C.terra : "transparent"}`, transition: "all .2s" }}>{t.l}</button>
          ))}
        </div>
        <div style={{ margin: "auto 14px 0" }}>
          <div style={{ background: `${C.white}05`, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.terra}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🏪</div>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 128 }}>{store?.nom}</div><div style={{ fontSize: 10, color: C.green }}>● En ligne</div></div>
            </div>
            <Btn variant="gold" onClick={onPreview} style={{ width: "100%", justifyContent: "center", padding: "9px", fontSize: 12 }}>👁 Voir ma boutique</Btn>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: C.white, fontWeight: 700, margin: 0 }}>
            {tab === "commandes" ? "Mes commandes" : "Mes produits"}
          </h1>
          <div style={{ display: "flex", gap: 10 }}>
            {tab === "produits" && <Btn onClick={() => setShowAdd(true)}>+ Ajouter</Btn>}
            <Btn variant="ghost" onClick={loadData} style={{ fontSize: 12, padding: "8px 16px" }}>↻ Actualiser</Btn>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            {tab === "commandes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {orders.length === 0 && (
                  <div style={{ textAlign: "center", padding: 60, color: `${C.white}35` }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Aucune commande pour l'instant</div>
                    <div style={{ fontSize: 13, marginTop: 8 }}>Les commandes de tes clients apparaîtront ici</div>
                  </div>
                )}
                {orders.map(o => (
                  <div key={o.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, display: "flex", gap: 15, alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{o.client_nom}</span>
                        <span style={{ fontSize: 11, color: `${C.white}32` }}>{o.id}</span>
                        <Badge status={o.status} />
                      </div>
                      <div style={{ fontSize: 13, color: `${C.white}58` }}>{o.article}</div>
                      <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 11, color: `${C.white}38`, flexWrap: "wrap" }}>
                        <span>📱 {o.client_phone}</span>
                        <span>💳 {o.payment}</span>
                        {o.livreur && <span>🛵 {o.livreur}</span>}
                        <span>📅 {new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 9 }}>{o.montant.toLocaleString()} <span style={{ fontSize: 11 }}>FCFA</span></div>
                      {(o.status === "nouveau" || o.status === "assigné") && <Btn onClick={() => setSel(o)} style={{ fontSize: 12, padding: "8px 15px" }}>Gérer →</Btn>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "produits" && (
              <>
                {showAdd && (
                  <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 22, marginBottom: 18, border: `1.5px solid ${C.terra}30`, animation: "scaleIn .3s ease both" }}>
                    <div style={{ fontWeight: 700, color: C.white, marginBottom: 14, fontSize: 15 }}>➕ Nouveau produit</div>
                    <input value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} placeholder="Nom du produit" style={inp} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 11 }}>
                      <input value={newP.price} onChange={e => setNewP({ ...newP, price: e.target.value })} placeholder="Prix FCFA" type="number" style={{ ...inp, marginBottom: 0 }} />
                      <input value={newP.stock} onChange={e => setNewP({ ...newP, stock: e.target.value })} placeholder="Stock" type="number" style={{ ...inp, marginBottom: 0 }} />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: `${C.white}45`, marginBottom: 8 }}>EMOJI DU PRODUIT</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["📦", "👗", "👠", "🧵", "🎨", "📿", "🌿", "💄", "🍎", "📱"].map(e => (
                          <button key={e} onClick={() => setNewP({ ...newP, image: e })} style={{ width: 40, height: 40, borderRadius: 10, border: `2px solid ${newP.image === e ? C.terra : C.border}`, background: newP.image === e ? `${C.terra}20` : `${C.white}04`, fontSize: 20, cursor: "pointer" }}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1, justifyContent: "center" }}>Annuler</Btn>
                      <Btn onClick={addProduct} disabled={saving} style={{ flex: 2, justifyContent: "center" }}>{saving ? "Enregistrement..." : "Ajouter ✓"}</Btn>
                    </div>
                  </div>
                )}
                {products.length === 0 && !showAdd && (
                  <div style={{ textAlign: "center", padding: 60, color: `${C.white}35` }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Aucun produit encore</div>
                    <div style={{ fontSize: 13, marginTop: 8, marginBottom: 24 }}>Ajoute ton premier produit</div>
                    <Btn onClick={() => setShowAdd(true)}>+ Ajouter un produit</Btn>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
                  {products.map(p => (
                    <div key={p.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                      <button onClick={() => deleteProduct(p.id)} style={{ position: "absolute", top: 12, right: 12, background: `${C.white}08`, border: `1px solid ${C.border}`, borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: `${C.white}60`, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      <div style={{ width: 52, height: 52, borderRadius: 15, background: `${C.white}07`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 13 }}>{p.image}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4, paddingRight: 32 }}>{p.name}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.gold, marginBottom: 3 }}>{p.price.toLocaleString()} <span style={{ fontSize: 11 }}>FCFA</span></div>
                      <div style={{ fontSize: 11, color: p.stock > 5 ? "#4ADE80" : p.stock > 0 ? "#F59E0B" : "#EF4444", fontWeight: 600 }}>Stock: {p.stock}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── ORDER MODAL ─────────────────────────────────────── */
function OrderModal({ order, onAssign, onMessage, onClose }) {
  const [step, setStep] = useState("detail");
  const [msg, setMsg] = useState(`Salam ${order.client_nom} ! Merci pour votre commande.\n\nArticle : ${order.article}\nMontant : ${order.montant.toLocaleString()} FCFA\nDélai : 2-3 heures\n\nNous vous contacterons à l'arrivée. Baraka !`);
  const [livreurInput, setLivreurInput] = useState("");

  return (
    <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto", padding: 26, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.7)`, animation: "scaleIn .3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.white }}>Commande #{order.id?.slice(-6)}</div><div style={{ fontSize: 12, color: `${C.white}48` }}>{order.client_nom} · {order.article}</div></div>
        <button onClick={onClose} style={{ background: `${C.white}08`, border: `1px solid ${C.border}`, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 15, color: `${C.white}75`, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>

      {step === "detail" && (<>
        <div style={{ background: `${C.white}04`, borderRadius: 14, padding: 16, marginBottom: 18, border: `1px solid ${C.border}` }}>
          {[["Client", order.client_nom], ["Téléphone", order.client_phone], ["Article", order.article], ["Montant", order.montant?.toLocaleString() + " FCFA"], ["Adresse", order.client_adresse || "Non renseignée"], ["Paiement", order.payment]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: `${C.white}48`, fontWeight: 600 }}>{k}</span><span style={{ color: C.white, fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="blue" onClick={() => setStep("livreur")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>🛵 Assigner</Btn>
          <Btn onClick={() => setStep("message")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>📲 Message</Btn>
        </div>
      </>)}

      {step === "livreur" && (<>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 12, fontSize: 15 }}>Nom du livreur</div>
        <input value={livreurInput} onChange={e => setLivreurInput(e.target.value)} placeholder="Ex : Moussa Diallo" style={{ width: "100%", padding: "13px 15px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 16 }} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>← Retour</Btn>
          <Btn variant="blue" onClick={() => livreurInput && onAssign(order.id, livreurInput)} disabled={!livreurInput} style={{ flex: 2, justifyContent: "center", fontSize: 13 }}>✓ Confirmer</Btn>
        </div>
      </>)}

      {step === "message" && (<>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 5, fontSize: 15 }}>Message au client</div>
        <div style={{ fontSize: 12, color: `${C.white}42`, marginBottom: 12 }}>Pour {order.client_nom} ({order.client_phone})</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ width: "100%", padding: "13px 15px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "'Outfit',sans-serif", color: C.white, background: `${C.white}05`, minHeight: 155, resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, outline: "none" }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>← Retour</Btn>
          <Btn onClick={() => onMessage(order.id, msg)} style={{ flex: 2, justifyContent: "center", fontSize: 13 }}>📲 Enregistrer →</Btn>
        </div>
      </>)}
    </div>
  );
}

/* ── BOUTIQUE CLIENT (SUPABASE RÉEL) ─────────────────── */
function BoutiqueClient({ store, onBack }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("store");
  const [form, setForm] = useState({ nom: "", phone: "", adresse: "", payment: "" });
  const [submitting, setSubmitting] = useState(false);
  const sc = C.terra;
  const marchandPhone = `+221${store?.phone}`;

  useEffect(() => {
    db.getProduitsPublics(marchandPhone)
      .then(p => { setProducts(p); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function addToCart(p) {
    setCart(prev => { const e = prev.find(i => i.id === p.id); return e ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; });
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  async function confirmerCommande() {
    if (!form.nom || !form.phone || !form.payment) return;
    setSubmitting(true);
    try {
      const cmdId = `CMD-${Date.now()}`;
      const article = cart.map(i => `${i.name} x${i.qty}`).join(", ");

      // Enregistrer dans Supabase
      await db.addCommande({
        id: cmdId,
        marchand_phone: marchandPhone,
        client_nom: form.nom,
        client_phone: form.phone,
        client_adresse: form.adresse,
        article,
        montant: total,
        payment: form.payment,
        status: "nouveau",
      });

      if (form.payment === "🚚 Paiement à la livraison") {
        setView("confirmed");
        setSubmitting(false);
        return;
      }

      // Paiement en ligne
      const resp = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant: total, description: article, client_nom: form.nom, client_phone: form.phone, commande_id: cmdId }),
      });
      const data = await resp.json();
      if (data.payment_url) { window.location.href = data.payment_url; }
      else { setView("confirmed"); }
    } catch (e) {
      alert("Erreur. Réessaie.");
    }
    setSubmitting(false);
  }

  const inp = { width: "100%", padding: "13px 15px", borderRadius: 13, background: `${C.white}07`, border: `1.5px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 11, transition: "border-color .3s" };

  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", maxWidth: 500, margin: "0 auto" }}>
      <style>{FONTS}{G}</style>
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, padding: "17px 18px 0", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 17 }}>
          <button onClick={onBack} style={{ background: `${C.white}07`, border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 13px", color: `${C.white}75`, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", flexShrink: 0 }}>← Retour</button>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: `${C.terra}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, flexShrink: 0 }}>🏪</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 17, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store?.nom}</div>
            <div style={{ fontSize: 10, color: `${C.white}40` }}>jaayma.sn/{store?.lien}</div>
          </div>
          {count > 0 && <button onClick={() => setView("cart")} style={{ background: `linear-gradient(135deg,${sc},${C.terr2})`, border: "none", borderRadius: 13, padding: "8px 15px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: C.white, flexShrink: 0 }}>🛒 {count}</button>}
        </div>
      </div>

      {view === "store" && (
        <div style={{ padding: 15 }}>
          {loading ? <Spinner /> : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: `${C.white}40` }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
              <div style={{ fontSize: 15 }}>Cette boutique n'a pas encore de produits.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {products.map(p => (
                <div key={p.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 17, overflow: "hidden", border: `1px solid ${C.border}` }}>
                  <div style={{ background: `${C.white}05`, height: 94, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, borderBottom: `1px solid ${C.border}` }}>{p.image}</div>
                  <div style={{ padding: 11 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 9 }}>{p.price.toLocaleString()} <span style={{ fontSize: 10 }}>FCFA</span></div>
                    {p.stock > 0 ? (
                      <button onClick={() => addToCart(p)} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${sc},${C.terr2})`, color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>+ Ajouter</button>
                    ) : (
                      <div style={{ width: "100%", padding: "9px", borderRadius: 10, background: `${C.white}08`, color: `${C.white}40`, fontSize: 12, fontWeight: 700, textAlign: "center" }}>Rupture</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 15, padding: 15, background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 15, border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: `${C.white}38`, marginBottom: 9, fontWeight: 700, letterSpacing: 1 }}>PAIEMENTS ACCEPTÉS</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 9, flexWrap: "wrap" }}>
              {["📱 Wave", "🟠 Orange Money", "🚚 Livraison"].map(m => <span key={m} style={{ background: `${C.white}07`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: `${C.white}65`, border: `1px solid ${C.border}` }}>{m}</span>)}
            </div>
          </div>
        </div>
      )}

      {view === "cart" && (
        <div style={{ padding: 15 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, color: C.white, marginBottom: 15, fontWeight: 700 }}>Mon panier</h3>
          {cart.map(item => (
            <div key={item.id} style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 15, padding: "13px 15px", marginBottom: 10, display: "flex", gap: 11, alignItems: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 26 }}>{item.image}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{item.name}</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: C.gold }}>{(item.price * item.qty).toLocaleString()} FCFA</div></div>
              <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 27, height: 27, borderRadius: "50%", background: `${C.white}07`, border: `1px solid ${C.border}`, cursor: "pointer", fontWeight: 700, color: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.white, width: 18, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => addToCart(item)} style={{ width: 27, height: 27, borderRadius: "50%", background: `linear-gradient(135deg,${sc},${C.terr2})`, border: "none", cursor: "pointer", fontSize: 16, color: C.white, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
            <Btn variant="ghost" onClick={() => setView("store")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>← Retour</Btn>
            <button onClick={() => setView("checkout")} style={{ flex: 2, padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${sc},${C.terr2})`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>Commander ({total.toLocaleString()} FCFA) →</button>
          </div>
        </div>
      )}

      {view === "checkout" && (
        <div style={{ padding: 15 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, color: C.white, marginBottom: 18, fontWeight: 700 }}>Finaliser la commande</h3>
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom complet" style={inp} onFocus={e => e.target.style.borderColor = sc} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone WhatsApp" style={inp} onFocus={e => e.target.style.borderColor = sc} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.adresse || ""} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Adresse de livraison" style={{ ...inp, marginBottom: 20 }} onFocus={e => e.target.style.borderColor = sc} onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}42`, marginBottom: 11, letterSpacing: 1 }}>MODE DE PAIEMENT</div>
            {["📱 Wave", "🟠 Orange Money", "🚚 Paiement à la livraison"].map(m => (
              <button key={m} onClick={() => setForm({ ...form, payment: m })} style={{ display: "block", width: "100%", padding: "13px 15px", marginBottom: 9, borderRadius: 13, border: `1.5px solid ${form.payment === m ? sc : C.border}`, background: form.payment === m ? `${sc}16` : `${C.white}04`, color: form.payment === m ? sc : `${C.white}58`, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textAlign: "left", transition: "all .2s" }}>{m}</button>
            ))}
          </div>
          <button disabled={!form.nom || !form.phone || !form.payment || submitting} onClick={confirmerCommande} style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: !form.nom || !form.phone || !form.payment ? `${C.white}0D` : `linear-gradient(135deg,${sc},${C.terr2})`, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .3s" }}>
            {submitting ? "⏳ Enregistrement..." : "✓ Confirmer la commande"}
          </button>
        </div>
      )}

      {view === "confirmed" && (
        <div style={{ padding: 38, textAlign: "center", animation: "scaleIn .5s ease both" }}>
          <div style={{ fontSize: 68, marginBottom: 18, animation: "float 3s ease-in-out infinite" }}>🎉</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, marginBottom: 12, fontWeight: 700 }}>Commande confirmée !</h2>
          <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, marginBottom: 22, textAlign: "left", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}38`, marginBottom: 13, letterSpacing: 1 }}>VOUS ALLEZ RECEVOIR</div>
            {["📲 Message WhatsApp du vendeur", "🛵 Notification quand le livreur est en route", "✅ Confirmation à la livraison"].map(s => (
              <div key={s} style={{ fontSize: 13, color: `${C.white}68`, marginBottom: 9, display: "flex", gap: 9 }}><span style={{ color: C.green }}>✓</span>{s.split(" ").slice(1).join(" ")}</div>
            ))}
          </div>
          <Btn onClick={() => { setView("store"); setCart([]); setForm({ nom: "", phone: "", adresse: "", payment: "" }); }}>Retour à la boutique</Btn>
        </div>
      )}
    </div>
  );
}

/* ── APP ROOT ────────────────────────────────────────── */
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

/* ── DASHBOARD LIVREUR ───────────────────────────────── */
function DashboardLivreur({ livreur }) {
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh" }}>
      <style>{FONTS}{G}</style>
      <div style={{ background: `linear-gradient(135deg,${C.delivery},#1D4ED8)`, padding: "22px 22px 26px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: 15, background: `${C.white}1E`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25 }}>🛵</div>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 21, color: C.white }}>Jaayma Livreur</div><div style={{ fontSize: 12, color: `${C.white}BB` }}>{livreur?.nom} · {livreur?.zone}</div></div>
        <div style={{ marginLeft: "auto", background: `${C.white}1E`, borderRadius: 20, padding: "6px 15px", fontSize: 12, fontWeight: 700, color: C.white }}>● Disponible</div>
      </div>
      <div style={{ padding: 24, textAlign: "center", color: `${C.white}50` }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛵</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>Bienvenue {livreur?.nom} !</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>Les missions te seront assignées par les vendeurs.</div>
      </div>
    </div>
  );
}
