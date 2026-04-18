import { useState, useEffect, useRef } from "react";

const C = {
  obsidian: "#0A0705",
  charcoal: "#141010",
  ember:    "#1E1510",
  terra:    "#C4572A",
  terr2:    "#E06535",
  gold:     "#E8A020",
  gold2:    "#F5C842",
  green:    "#1A7A4A",
  cream:    "#FDF6EC",
  white:    "#FFFFFF",
  gray:     "#8C7B6E",
  border:   "#2A1F18",
  mid:      "#5C3D2E",
  delivery: "#2563EB",
  sand:     "#D4A574",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600;700;800&display=swap');`;

const DEMO_PRODUCTS = [
  {id:1,name:"Boubou brodé premium",price:45000,stock:12,image:"🧵",orders:34,tag:"Bestseller"},
  {id:2,name:"Tissu wax 6 yards",price:18000,stock:25,image:"🎨",orders:67,tag:"Nouveau"},
  {id:3,name:"Collier en or 18k",price:85000,stock:5,image:"📿",orders:12,tag:"Exclusif"},
  {id:4,name:"Encens thiouraye",price:3500,stock:80,image:"🌿",orders:156,tag:"Populaire"},
];
const DEMO_LIVREURS = [
  {id:1,nom:"Moussa Diallo",telephone:"77 123 45 67",zone:"Dakar Plateau",disponible:true},
  {id:2,nom:"Ibou Fall",telephone:"76 234 56 78",zone:"Parcelles Assainies",disponible:true},
  {id:3,nom:"Cheikh Ba",telephone:"70 345 67 89",zone:"Guédiawaye",disponible:false},
];
const DEMO_ORDERS = [
  {id:"CMD-0041",client:"Marième Diallo",clientPhone:"77 456 78 90",article:"Boubou brodé premium",montant:45000,adresse:"Rue 10, Médina, Dakar",date:"Aujourd'hui 14:32",status:"nouveau",payment:"Wave",livreur:null,message:""},
  {id:"CMD-0040",client:"Ibrahima Seck",clientPhone:"76 567 89 01",article:"Tissu wax 6 yards",montant:18000,adresse:"HLM Grand Yoff",date:"Aujourd'hui 11:08",status:"livré",payment:"Orange Money",livreur:"Moussa Diallo",message:"Merci !"},
  {id:"CMD-0039",client:"Aïssatou Ba",clientPhone:"70 678 90 12",article:"Encens thiouraye x3",montant:10500,adresse:"Pikine Tally Bou Mak",date:"Hier 18:45",status:"en cours",payment:"Livraison",livreur:"Ibou Fall",message:""},
];

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
@keyframes gradMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
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
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); } }),
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
  const base = { border: "none", cursor: disabled ? "default" : "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 700, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.38 : 1, position: "relative", overflow: "hidden" };
  const v = {
    primary: { background: `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, padding: "13px 28px", fontSize: 14, boxShadow: `0 4px 20px ${C.terra}44` },
    gold: { background: `linear-gradient(135deg,${C.gold},${C.gold2})`, color: C.obsidian, padding: "13px 28px", fontSize: 14, boxShadow: `0 4px 20px ${C.gold}44` },
    ghost: { background: `${C.white}08`, color: C.white, padding: "12px 24px", fontSize: 14, border: `1px solid ${C.white}15` },
    outline: { background: "transparent", color: C.terra, padding: "12px 24px", fontSize: 14, border: `2px solid ${C.terra}66` },
    blue: { background: `linear-gradient(135deg,${C.delivery},#3B82F6)`, color: C.white, padding: "13px 28px", fontSize: 14 },
    green: { background: `linear-gradient(135deg,${C.green},#22A05A)`, color: C.white, padding: "13px 28px", fontSize: 14 },
  };
  return <button onClick={disabled ? undefined : onClick} className="mag" style={{ ...base, ...v[variant], ...style }}>{children}</button>;
}

/* LANDING */
function Landing({ onVendeur, onLivreur }) {
  useReveal();
  const [nav, setNav] = useState(false);
  const bg = useRef(null);

  useEffect(() => {
    const h = () => {
      setNav(window.scrollY > 40);
      if (bg.current) bg.current.style.transform = `translateY(${window.scrollY * 0.18}px)`;
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", overflowX: "hidden" }}>
      <style>{FONTS}{G}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 500, padding: "0 6%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: nav ? `${C.obsidian}F0` : "transparent", backdropFilter: nav ? "blur(20px)" : "none", borderBottom: nav ? `1px solid ${C.border}` : "none", transition: "all .4s ease", animation: "fadeIn .8s ease both" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: 1 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={onLivreur} style={{ fontSize: 13, padding: "8px 16px" }}>🛵 Livreur</Btn>
          <Btn onClick={onVendeur} style={{ fontSize: 13, padding: "10px 20px" }}>Créer ma boutique</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", padding: "100px 6% 60px", overflow: "hidden" }}>
        <div className="orb" style={{ width: 600, height: 600, background: `${C.terra}1A`, top: -120, right: -120, animationDelay: "0s" }} />
        <div className="orb" style={{ width: 400, height: 400, background: `${C.gold}0F`, bottom: -60, left: "18%", animationDelay: "2s" }} />
        <div className="orb" style={{ width: 280, height: 280, background: `${C.green}0D`, top: "45%", left: -80, animationDelay: "4s" }} />
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
                <div key={l}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: C.terra, lineHeight: 1 }}><AnimNum n={n} />{s}</div>
                  <div style={{ fontSize: 11, color: `${C.white}40`, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hv" style={{ width: 360, flexShrink: 0 }}>
            <div style={{ background: `linear-gradient(160deg,${C.charcoal},${C.ember})`, borderRadius: 28, padding: 28, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.6),0 0 0 1px ${C.white}04`, animation: "scaleIn 1s ease both .5s" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}35`, letterSpacing: 2, marginBottom: 22 }}>COMMENT ÇA MARCHE</div>
              {[
                { icon: "👤", color: "#7C3AED", title: "Client commande", sub: "Paie via Wave ou Orange Money" },
                { icon: "📲", color: C.terra, title: "Vendeur notifié", sub: "WhatsApp instantané" },
                { icon: "🛵", color: C.delivery, title: "Livreur assigné", sub: "Reçoit l'adresse en temps réel" },
                { icon: "✅", color: C.green, title: "Livraison confirmée", sub: "Client reçoit la confirmation" },
              ].map((s, i) => (
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

      {/* FEATURES */}
      <section style={{ padding: "90px 6%", position: "relative" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.terra, letterSpacing: 3, marginBottom: 14 }}>TOUT CE DONT TU AS BESOIN</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 700, color: C.white }}>Une plateforme. <span className="gs">Toutes les fonctions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {[
              { icon: "🏪", title: "Boutique en 3 min", desc: "Catalogue, lien personnalisé, couleurs. Aucun code requis.", color: C.terra },
              { icon: "📲", title: "Notifs WhatsApp", desc: "Chaque commande arrive direct sur ton WhatsApp avec tous les détails.", color: C.gold },
              { icon: "💳", title: "Wave & Orange Money", desc: "Paiements intégrés. Tes clients paient en un clic.", color: "#22C55E" },
              { icon: "🛵", title: "Réseau livreurs", desc: "Assigne les commandes aux livreurs de ta zone en temps réel.", color: C.delivery },
            ].map((f, i) => (
              <div key={i} className="reveal ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 22, padding: 26, border: `1px solid ${C.border}`, cursor: "default", transitionDelay: `${i * .09}s` }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: `${f.color}1E`, border: `1.5px solid ${f.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 700, color: C.white, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: `${C.white}58`, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "90px 6%", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,${C.terra}10 0%,transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.terra, letterSpacing: 3, marginBottom: 14 }}>TARIFS</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(30px,4vw,50px)", fontWeight: 700, color: C.white }}>Des prix <span className="gs">honnêtes</span></h2>
          </div>
          <div className="pg" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, alignItems: "center" }}>
            {[
              { name: "Démarrage", price: "Gratuit", sub: "", features: ["1 boutique", "10 produits", "Notifs WhatsApp", "Lien personnalisé"], feat: false },
              { name: "Commerçant", price: "4 900", sub: "FCFA/mois", features: ["Produits illimités", "Livreurs intégrés", "Wave + Orange Money", "Stats avancées", "Domaine .sn"], feat: true },
              { name: "Business", price: "14 900", sub: "FCFA/mois", features: ["Multi-boutiques", "API livreurs", "Support prioritaire", "Facturation auto"], feat: false },
            ].map((p, i) => (
              <div key={i} className={`reveal ch ${p.feat ? "pf" : ""}`} style={{ background: p.feat ? `linear-gradient(160deg,${C.terra},#9A3A18)` : `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 22, padding: p.feat ? 30 : 24, border: `1px solid ${p.feat ? C.terra + "88" : C.border}`, transform: p.feat ? "scale(1.04)" : "none", boxShadow: p.feat ? `0 28px 70px ${C.terra}44` : "none", position: "relative", overflow: "hidden", transitionDelay: `${i * .09}s` }}>
                {p.feat && <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(90deg,${C.gold},${C.gold2})`, color: C.obsidian, fontSize: 10, fontWeight: 800, padding: "4px 16px", borderRadius: "0 0 10px 10px", letterSpacing: 1 }}>★ LE PLUS POPULAIRE</div>}
                <div style={{ fontSize: 11, fontWeight: 700, color: p.feat ? `${C.white}AA` : `${C.white}45`, letterSpacing: 2, marginBottom: 8 }}>{p.name.toUpperCase()}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: p.price === "Gratuit" ? 34 : 40, fontWeight: 700, color: C.white, lineHeight: 1 }}>
                  {p.price === "Gratuit" ? "Gratuit" : <>{p.price} <span style={{ fontSize: 14, fontWeight: 400, color: `${C.white}70` }}>{p.sub}</span></>}
                </div>
                <div style={{ height: 1, background: p.feat ? `${C.white}1E` : C.border, margin: "18px 0" }} />
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 9 }}>
                    <span style={{ color: p.feat ? C.gold : C.terra, fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 13, color: p.feat ? C.white : `${C.white}70` }}>{f}</span>
                  </div>
                ))}
                <div style={{ marginTop: 22 }}>
                  <Btn onClick={onVendeur} variant={p.feat ? "gold" : "ghost"} style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>{p.feat ? "Commencer maintenant →" : "Choisir"}</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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

/* INSCRIPTION VENDEUR */
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
      <div className="orb" style={{ width: 300, height: 300, background: `${C.gold}0D`, bottom: 0, left: -70 }} />
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

/* INSCRIPTION LIVREUR */
function InscriptionLivreur({ onComplete }) {
  const [phone, setPhone] = useState(""); const [nom, setNom] = useState(""); const [zone, setZone] = useState("");
  const zones = ["Dakar Plateau", "Médina", "Parcelles Assainies", "Guédiawaye", "Pikine", "Rufisque", "Thiès", "Autre"];
  const inp = { width: "100%", padding: "13px 16px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, outline: "none", fontSize: 14, fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", transition: "border-color .3s" };
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <style>{FONTS}{G}</style>
      <div className="orb" style={{ width: 380, height: 380, background: `${C.delivery}12`, top: -80, left: -70 }} />
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, color: C.white, marginBottom: 34, letterSpacing: 1 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
      <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 26, padding: 38, width: "100%", maxWidth: 450, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.5)`, animation: "scaleIn .5s ease both" }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: `${C.delivery}1E`, border: `1.5px solid ${C.delivery}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, marginBottom: 18 }}>🛵</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, marginBottom: 5, fontWeight: 700 }}>Espace Livreur</h2>
        <p style={{ color: `${C.white}48`, fontSize: 14, marginBottom: 26 }}>Inscris-toi pour recevoir des missions.</p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}45`, marginBottom: 7, letterSpacing: 1 }}>PRÉNOM ET NOM</div>
          <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Moussa Diallo" style={inp} onFocus={e => e.target.style.borderColor = C.delivery} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
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
            {zones.map(z => (
              <button key={z} onClick={() => setZone(z)} style={{ padding: "10px 12px", borderRadius: 12, border: `1.5px solid ${zone === z ? C.delivery : C.border}`, background: zone === z ? `${C.delivery}1E` : `${C.white}04`, color: zone === z ? "#93C5FD" : `${C.white}50`, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "all .2s" }}>{z}</button>
            ))}
          </div>
        </div>
        <Btn variant="blue" onClick={() => nom && phone && zone && onComplete({ nom, phone, zone })} disabled={!nom || !phone || !zone} style={{ width: "100%", justifyContent: "center", fontSize: 15, padding: "15px" }}>🛵 Rejoindre Jaayma →</Btn>
      </div>
    </div>
  );
}

/* ORDER MODAL */
function OrderModal({ order, livreurs, onAssign, onMessage, onClose }) {
  const [step, setStep] = useState("detail");
  const [msg, setMsg] = useState(`Salam ${order.client} ! Merci pour votre commande.\n\nArticle : ${order.article}\nMontant : ${order.montant.toLocaleString()} FCFA\nDélai : 2-3 heures\n\nNous vous contacterons à l'arrivée. Baraka !`);
  return (
    <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 24, width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto", padding: 26, border: `1px solid ${C.border}`, boxShadow: `0 40px 80px rgba(0,0,0,.7)`, animation: "scaleIn .3s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.white }}>{order.id}</div><div style={{ fontSize: 12, color: `${C.white}48` }}>{order.client} · {order.article}</div></div>
        <button onClick={onClose} style={{ background: `${C.white}08`, border: `1px solid ${C.border}`, borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 15, color: `${C.white}75`, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
      </div>
      {step === "detail" && (<>
        <div style={{ background: `${C.white}04`, borderRadius: 14, padding: 16, marginBottom: 18, border: `1px solid ${C.border}` }}>
          {[["Client", order.client], ["Tél.", order.clientPhone], ["Article", order.article], ["Montant", order.montant.toLocaleString() + " FCFA"], ["Adresse", order.adresse], ["Paiement", order.payment]].map(([k, v]) => (
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
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 14, fontSize: 15 }}>Choisir un livreur</div>
        {livreurs.map(l => (
          <div key={l.id} onClick={() => l.disponible && onAssign(order.id, l)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 14, border: `1.5px solid ${C.border}`, marginBottom: 9, cursor: l.disponible ? "pointer" : "default", opacity: l.disponible ? 1 : 0.4, background: `${C.white}03`, transition: "all .2s" }}
            onMouseEnter={e => { if (l.disponible) { e.currentTarget.style.borderColor = C.delivery; e.currentTarget.style.background = `${C.delivery}12`; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = `${C.white}03`; }}>
            <div style={{ fontSize: 24 }}>🛵</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{l.nom}</div><div style={{ fontSize: 12, color: `${C.white}48` }}>📍 {l.zone}</div></div>
            <span style={{ fontSize: 11, fontWeight: 700, color: l.disponible ? "#4ADE80" : "#F59E0B", background: l.disponible ? "#0A2A1A" : "#2A1A0A", borderRadius: 20, padding: "3px 11px" }}>{l.disponible ? "● Dispo" : "○ Occupé"}</span>
          </div>
        ))}
        <Btn variant="ghost" onClick={() => setStep("detail")} style={{ marginTop: 8, fontSize: 13 }}>← Retour</Btn>
      </>)}
      {step === "message" && (<>
        <div style={{ fontWeight: 700, color: C.white, marginBottom: 5, fontSize: 15 }}>Message WhatsApp</div>
        <div style={{ fontSize: 12, color: `${C.white}42`, marginBottom: 12 }}>Envoyé à {order.client}</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} style={{ width: "100%", padding: "13px 15px", borderRadius: 14, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: "'Outfit',sans-serif", color: C.white, background: `${C.white}05`, minHeight: 155, resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, outline: "none", transition: "border-color .3s" }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <Btn variant="ghost" onClick={() => setStep("detail")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>← Retour</Btn>
          <Btn onClick={() => onMessage(order.id, msg)} style={{ flex: 2, justifyContent: "center", fontSize: 13 }}>📲 Envoyer →</Btn>
        </div>
      </>)}
    </div>
  );
}

/* DASHBOARD VENDEUR */
function DashboardVendeur({ store, onPreview }) {
  const [tab, setTab] = useState("commandes");
  const [orders, setOrders] = useState(DEMO_ORDERS);
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [sel, setSel] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name: "", price: "", stock: "", image: "📦" });
  const [toast, setToast] = useState(null);
  function st(m) { setToast(m); setTimeout(() => setToast(null), 3000); }
  function assignerLivreur(id, l) { setOrders(orders.map(o => o.id === id ? { ...o, livreur: l.nom, status: "assigné" } : o)); st(`✅ ${l.nom} notifié !`); setSel(null); }
  function envMsg(id, m) { setOrders(orders.map(o => o.id === id ? { ...o, message: m, status: "en cours" } : o)); st("📲 Message envoyé !"); setSel(null); }
  function addP() { if (!newP.name || !newP.price) return; setProducts([...products, { id: Date.now(), name: newP.name, price: parseInt(newP.price), stock: parseInt(newP.stock) || 0, image: newP.image, orders: 0 }]); setNewP({ name: "", price: "", stock: "", image: "📦" }); setShowAdd(false); st("✅ Produit ajouté !"); }
  const rev = orders.reduce((s, o) => s + o.montant, 0);
  const tabs = [{ id: "commandes", l: "🛒 Commandes" }, { id: "produits", l: "📦 Produits" }, { id: "livreurs", l: "🛵 Livreurs" }];
  const inp = { width: "100%", padding: "12px 15px", borderRadius: 12, background: `${C.white}06`, border: `1px solid ${C.border}`, fontSize: 14, outline: "none", fontFamily: "'Outfit',sans-serif", color: C.white, boxSizing: "border-box", marginBottom: 11, transition: "border-color .3s" };

  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh", display: "flex" }}>
      <style>{FONTS}{G}</style>
      {toast && <div style={{ position: "fixed", top: 22, right: 22, zIndex: 1000, background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, color: C.white, borderRadius: 16, padding: "13px 20px", fontSize: 13, fontWeight: 600, border: `1px solid ${C.terra}44`, boxShadow: `0 8px 40px rgba(0,0,0,.5)`, animation: "scaleIn .3s ease both" }}>{toast}</div>}
      {sel && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}><OrderModal order={sel} livreurs={DEMO_LIVREURS} onAssign={assignerLivreur} onMessage={envMsg} onClose={() => setSel(null)} /></div>}

      {/* Sidebar */}
      <div className="ds" style={{ width: 236, background: `linear-gradient(180deg,${C.charcoal},${C.obsidian})`, flexShrink: 0, display: "flex", flexDirection: "column", padding: "26px 0", borderRight: `1px solid ${C.border}` }}>
        <div style={{ padding: "0 22px 22px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 25, fontWeight: 700, color: C.white, letterSpacing: 1 }}>Jaayma<span style={{ color: C.gold }}>.</span></div>
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
              <div><div style={{ fontSize: 12, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 128 }}>{store?.nom || "Ma Boutique"}</div><div style={{ fontSize: 10, color: C.green }}>● En ligne</div></div>
            </div>
            <Btn variant="gold" onClick={onPreview} style={{ width: "100%", justifyContent: "center", padding: "9px", fontSize: 12 }}>👁 Voir ma boutique</Btn>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 28, background: C.obsidian }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: C.white, fontWeight: 700, margin: 0 }}>
            {tab === "commandes" && "Mes commandes"}{tab === "produits" && "Mes produits"}{tab === "livreurs" && "Mes livreurs"}
          </h1>
          {tab === "produits" && <Btn onClick={() => setShowAdd(true)}>+ Ajouter</Btn>}
        </div>

        {tab === "commandes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {orders.map(o => (
              <div key={o.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, display: "flex", gap: 15, alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{o.client}</span>
                    <span style={{ fontSize: 11, color: `${C.white}32` }}>{o.id}</span>
                    <Badge status={o.status} />
                  </div>
                  <div style={{ fontSize: 13, color: `${C.white}58` }}>{o.article}</div>
                  <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 11, color: `${C.white}38`, flexWrap: "wrap" }}>
                    <span>📅 {o.date}</span><span>💳 {o.payment}</span>{o.livreur && <span>🛵 {o.livreur}</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: C.gold, marginBottom: 9 }}>{o.montant.toLocaleString()} <span style={{ fontSize: 11 }}>FCFA</span></div>
                  {o.status === "nouveau" && <Btn onClick={() => setSel(o)} style={{ fontSize: 12, padding: "8px 15px" }}>Gérer →</Btn>}
                  {o.status === "assigné" && <Btn onClick={() => setSel(o)} variant="ghost" style={{ fontSize: 12, padding: "8px 15px" }}>Envoyer msg</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "produits" && (<>
          {showAdd && (
            <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 22, marginBottom: 18, border: `1.5px solid ${C.terra}30`, animation: "scaleIn .3s ease both" }}>
              <div style={{ fontWeight: 700, color: C.white, marginBottom: 14, fontSize: 15 }}>➕ Nouveau produit</div>
              <input value={newP.name} onChange={e => setNewP({ ...newP, name: e.target.value })} placeholder="Nom du produit" style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 14 }}>
                <input value={newP.price} onChange={e => setNewP({ ...newP, price: e.target.value })} placeholder="Prix FCFA" type="number" style={{ ...inp, marginBottom: 0 }} />
                <input value={newP.stock} onChange={e => setNewP({ ...newP, stock: e.target.value })} placeholder="Stock" type="number" style={{ ...inp, marginBottom: 0 }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1, justifyContent: "center" }}>Annuler</Btn>
                <Btn onClick={addP} style={{ flex: 2, justifyContent: "center" }}>Ajouter ✓</Btn>
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
            {products.map(p => (
              <div key={p.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
                {p.tag && <div style={{ position: "absolute", top: 12, right: 12, background: `${C.terra}28`, color: C.terra, fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: `1px solid ${C.terra}40` }}>{p.tag}</div>}
                <div style={{ width: 52, height: 52, borderRadius: 15, background: `${C.white}07`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 13 }}>{p.image}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.gold, marginBottom: 3 }}>{p.price.toLocaleString()} <span style={{ fontSize: 11 }}>FCFA</span></div>
                <div style={{ fontSize: 11, color: p.stock > 5 ? "#4ADE80" : "#F59E0B", fontWeight: 600 }}>Stock: {p.stock}</div>
              </div>
            ))}
          </div>
        </>)}

        {tab === "livreurs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {DEMO_LIVREURS.map(l => (
              <div key={l.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 15 }}>
                <div style={{ width: 48, height: 48, borderRadius: 15, background: `${C.delivery}1E`, border: `1.5px solid ${C.delivery}32`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23 }}>🛵</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{l.nom}</div><div style={{ fontSize: 12, color: `${C.white}42` }}>📍 {l.zone} · 📱 {l.telephone}</div></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: l.disponible ? "#4ADE80" : "#F59E0B", background: l.disponible ? "#0A2A1A" : "#2A1A0A", borderRadius: 20, padding: "4px 13px", border: `1px solid ${l.disponible ? "#4ADE8030" : "#F59E0B30"}` }}>{l.disponible ? "● Disponible" : "○ Occupé"}</span>
              </div>
            ))}
            <div style={{ background: `${C.delivery}0D`, borderRadius: 18, padding: 20, border: `1.5px dashed ${C.delivery}32`, textAlign: "center", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = `${C.delivery}16`} onMouseLeave={e => e.currentTarget.style.background = `${C.delivery}0D`}>
              <div style={{ fontSize: 14, color: `${C.delivery}CC`, fontWeight: 600 }}>+ Ajouter un livreur partenaire</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* DASHBOARD LIVREUR */
function DashboardLivreur({ livreur }) {
  const [missions] = useState([
    { id: "CMD-0041", vendeur: "Mariama Mode", client: "Marième Diallo", article: "Boubou brodé premium", adresse: "Rue 10, Médina, Dakar", montant: 45000, status: "nouveau", heure: "14:32" },
    { id: "CMD-0039", vendeur: "Boutique Diallo", client: "Aïssatou Ba", article: "Encens thiouraye x3", adresse: "Pikine Tally Bou Mak", montant: 10500, status: "en cours", heure: "18:45" },
  ]);
  return (
    <div className="page" style={{ fontFamily: "'Outfit',sans-serif", background: C.obsidian, minHeight: "100vh" }}>
      <style>{FONTS}{G}</style>
      <div style={{ background: `linear-gradient(135deg,${C.delivery},#1D4ED8)`, padding: "22px 22px 26px", display: "flex", alignItems: "center", gap: 14, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: `${C.white}0D` }} />
        <div style={{ width: 50, height: 50, borderRadius: 15, background: `${C.white}1E`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25 }}>🛵</div>
        <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 21, color: C.white }}>Jaayma Livreur</div><div style={{ fontSize: 12, color: `${C.white}BB` }}>{livreur?.nom || "Moussa Diallo"} · {livreur?.zone || "Dakar Plateau"}</div></div>
        <div style={{ marginLeft: "auto", background: `${C.white}1E`, borderRadius: 20, padding: "6px 15px", fontSize: 12, fontWeight: 700, color: C.white }}>● Disponible</div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontWeight: 700, color: C.white, fontSize: 15, marginBottom: 15 }}>📦 Mes missions ({missions.length})</div>
        {missions.map(m => (
          <div key={m.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, marginBottom: 12, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{m.client}</div><div style={{ fontSize: 12, color: `${C.white}48` }}>{m.article} · {m.vendeur}</div></div>
              <Badge status={m.status} />
            </div>
            <div style={{ background: `${C.white}05`, borderRadius: 12, padding: "10px 13px", marginBottom: 13, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: `${C.white}68`, fontWeight: 600 }}>📍 {m.adresse}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="https://wa.me/221" style={{ flex: 1, padding: "11px", borderRadius: 12, background: "#16A34A", color: C.white, fontSize: 12, fontWeight: 700, textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>📲 Contacter</a>
              <button style={{ flex: 1, padding: "11px", borderRadius: 12, background: `linear-gradient(135deg,${C.delivery},#3B82F6)`, color: C.white, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>✅ Confirmer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* BOUTIQUE CLIENT */
function BoutiqueClient({ store, onBack }) {
  const [cart, setCart] = useState([]); const [view, setView] = useState("store"); const [form, setForm] = useState({ nom: "", phone: "", adresse: "", payment: "" }); const [loading, setLoading] = useState(false);
  const sc = store?.color || C.terra;
  function addToCart(p) { setCart(prev => { const e = prev.find(i => i.id === p.id); return e ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; }); }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0); const count = cart.reduce((s, i) => s + i.qty, 0);
  async function confirmerCommande() {
    if (!form.nom || !form.phone || !form.payment) return;
    if (form.payment === "🚚 Paiement à la livraison") { setView("confirmed"); return; }
    setLoading(true);
    try {
      const desc = cart.map(i => `${i.name} x${i.qty}`).join(", ");
      const resp = await fetch("/api/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ montant: total, description: desc, client_nom: form.nom, client_phone: form.phone, commande_id: `CMD-${Date.now()}` }) });
      const data = await resp.json();
      if (data.payment_url) { window.location.href = data.payment_url; } else { alert("Erreur de paiement. Réessaie."); }
    } catch (e) { alert("Erreur. Réessaie."); }
    setLoading(false);
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
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 17, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{store?.nom || "Mariama Mode"}</div>
            <div style={{ fontSize: 10, color: `${C.white}40` }}>jaayma.sn/{store?.lien || "mariama-mode"}</div>
          </div>
          {count > 0 && <button onClick={() => setView("cart")} style={{ background: `linear-gradient(135deg,${C.terra},${C.terr2})`, border: "none", borderRadius: 13, padding: "8px 15px", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: C.white, flexShrink: 0, boxShadow: `0 4px 15px ${C.terra}44` }}>🛒 {count}</button>}
        </div>
      </div>

      {view === "store" && (
        <div style={{ padding: 15 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {DEMO_PRODUCTS.map(p => (
              <div key={p.id} className="ch" style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 17, overflow: "hidden", border: `1px solid ${C.border}` }}>
                <div style={{ background: `${C.white}05`, height: 94, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, borderBottom: `1px solid ${C.border}`, position: "relative" }}>
                  {p.tag && <span style={{ position: "absolute", top: 7, left: 7, background: `${C.terra}28`, color: C.terra, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, border: `1px solid ${C.terra}40` }}>{p.tag}</span>}
                  {p.image}
                </div>
                <div style={{ padding: 11 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 3, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: C.gold, marginBottom: 9 }}>{p.price.toLocaleString()} <span style={{ fontSize: 10 }}>FCFA</span></div>
                  <button onClick={() => addToCart(p)} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", transition: "opacity .2s" }} onMouseEnter={e => e.currentTarget.style.opacity = ".82"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>+ Ajouter</button>
                </div>
              </div>
            ))}
          </div>
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
                <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} style={{ width: 27, height: 27, borderRadius: "50%", background: `${C.white}07`, border: `1px solid ${C.border}`, cursor: "pointer", fontWeight: 700, color: C.white, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.white, width: 18, textAlign: "center" }}>{item.qty}</span>
                <button onClick={() => addToCart(item)} style={{ width: 27, height: 27, borderRadius: "50%", background: `linear-gradient(135deg,${C.terra},${C.terr2})`, border: "none", cursor: "pointer", fontSize: 16, color: C.white, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
            <Btn variant="ghost" onClick={() => setView("store")} style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>← Retour</Btn>
            <button onClick={() => setView("checkout")} style={{ flex: 2, padding: "14px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: `0 4px 20px ${C.terra}44` }}>Commander ({total.toLocaleString()} FCFA) →</button>
          </div>
        </div>
      )}

      {view === "checkout" && (
        <div style={{ padding: 15 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, color: C.white, marginBottom: 18, fontWeight: 700 }}>Finaliser la commande</h3>
          <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Votre nom complet" style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Téléphone WhatsApp" style={inp} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          <input value={form.adresse || ""} onChange={e => setForm({ ...form, adresse: e.target.value })} placeholder="Adresse de livraison" style={{ ...inp, marginBottom: 18 }} onFocus={e => e.target.style.borderColor = C.terra} onBlur={e => e.target.style.borderColor = C.border} />
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: `${C.white}42`, marginBottom: 11, letterSpacing: 1 }}>MODE DE PAIEMENT</div>
            {["📱 Wave", "🟠 Orange Money", "🚚 Paiement à la livraison"].map(m => (
              <button key={m} onClick={() => setForm({ ...form, payment: m })} style={{ display: "block", width: "100%", padding: "13px 15px", marginBottom: 9, borderRadius: 13, border: `1.5px solid ${form.payment === m ? C.terra : C.border}`, background: form.payment === m ? `${C.terra}16` : `${C.white}04`, color: form.payment === m ? C.terra : `${C.white}58`, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", textAlign: "left", transition: "all .2s" }}>{m}</button>
            ))}
          </div>
          <button disabled={!form.nom || !form.phone || !form.payment || loading} onClick={confirmerCommande} style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: !form.nom || !form.phone || !form.payment ? `${C.white}0D` : `linear-gradient(135deg,${C.terra},${C.terr2})`, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: form.nom && form.phone && form.payment ? `0 4px 20px ${C.terra}44` : "none", transition: "all .3s" }}>
            {loading ? "⏳ Redirection vers le paiement..." : "✓ Confirmer la commande"}
          </button>
          {form.payment && form.payment !== "🚚 Paiement à la livraison" && <div style={{ textAlign: "center", marginTop: 11, fontSize: 11, color: `${C.white}32` }}>Tu seras redirigé vers PayTech via {form.payment}</div>}
        </div>
      )}

      {view === "confirmed" && (
        <div style={{ padding: 38, textAlign: "center", animation: "scaleIn .5s ease both" }}>
          <div style={{ fontSize: 68, marginBottom: 18, animation: "float 3s ease-in-out infinite" }}>🎉</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: C.white, marginBottom: 12, fontWeight: 700 }}>Commande confirmée !</h2>
          <div style={{ background: `linear-gradient(135deg,${C.charcoal},${C.ember})`, borderRadius: 18, padding: 20, marginBottom: 22, textAlign: "left", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: `${C.white}38`, marginBottom: 13, letterSpacing: 1 }}>VOUS ALLEZ RECEVOIR</div>
            {["📲 Message WhatsApp du vendeur", "🛵 Notification quand le livreur est en route", "✅ Confirmation à la livraison"].map(s => (
              <div key={s} style={{ fontSize: 13, color: `${C.white}68`, marginBottom: 9, display: "flex", gap: 9, alignItems: "center" }}>
                <span style={{ color: C.green }}>✓</span>{s.split(" ").slice(1).join(" ")}
              </div>
            ))}
          </div>
          <Btn onClick={() => { setView("store"); setCart([]); setForm({ nom: "", phone: "", adresse: "", payment: "" }); }} style={{ fontSize: 14 }}>Retour à la boutique</Btn>
        </div>
      )}
    </div>
  );
}

/* APP ROOT */
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
