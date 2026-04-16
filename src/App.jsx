import { useState } from "react";

const C = {
  terra:"#C4572A",gold:"#E8A020",green:"#1A7A4A",
  cream:"#FDF6EC",dark:"#1A0D06",mid:"#5C3D2E",
  light:"#F5E6D3",white:"#FFFFFF",gray:"#8C7B6E",
  border:"#E8D5C0",bg:"#F0EDE8",
  delivery:"#2563EB",deliveryLight:"#EFF6FF",
};

const FONTS=`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');`;

// ─── DEMO DATA ────────────────────────────────────────────────────
const DEMO_PRODUCTS=[
  {id:1,name:"Boubou brodé premium",price:45000,stock:12,image:"🧵",orders:34},
  {id:2,name:"Tissu wax 6 yards",price:18000,stock:25,image:"🎨",orders:67},
  {id:3,name:"Collier en or 18k",price:85000,stock:5,image:"📿",orders:12},
  {id:4,name:"Encens thiouraye",price:3500,stock:80,image:"🌿",orders:156},
];

const DEMO_LIVREURS=[
  {id:1,nom:"Moussa Diallo",telephone:"77 123 45 67",zone:"Dakar Plateau",disponible:true},
  {id:2,nom:"Ibou Fall",telephone:"76 234 56 78",zone:"Parcelles Assainies",disponible:true},
  {id:3,nom:"Cheikh Ba",telephone:"70 345 67 89",zone:"Guédiawaye",disponible:false},
];

const DEMO_ORDERS=[
  {id:"CMD-0041",client:"Marième Diallo",clientPhone:"77 456 78 90",article:"Boubou brodé premium",montant:45000,adresse:"Rue 10, Médina, Dakar",date:"Aujourd'hui 14:32",status:"nouveau",payment:"Wave",livreur:null,message:""},
  {id:"CMD-0040",client:"Ibrahima Seck",clientPhone:"76 567 89 01",article:"Tissu wax 6 yards",montant:18000,adresse:"HLM Grand Yoff",date:"Aujourd'hui 11:08",status:"livré",payment:"Orange Money",livreur:"Moussa Diallo",message:"Merci pour votre commande ! Livraison effectuée."},
  {id:"CMD-0039",client:"Aïssatou Ba",clientPhone:"70 678 90 12",article:"Encens thiouraye x3",montant:10500,adresse:"Pikine Tally Bou Mak",date:"Hier 18:45",status:"en cours",payment:"Livraison",livreur:"Ibou Fall",message:""},
];

// ─── HELPERS ──────────────────────────────────────────────────────
function Btn({children,onClick,variant="primary",style={},disabled=false}){
  const base={border:"none",cursor:disabled?"default":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,borderRadius:12,transition:"all 0.2s",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,opacity:disabled?0.5:1};
  const v={
    primary:{background:C.terra,color:C.white,padding:"13px 26px",fontSize:14,boxShadow:`0 4px 16px ${C.terra}44`},
    secondary:{background:"transparent",color:C.terra,padding:"12px 25px",fontSize:14,border:`2px solid ${C.terra}`},
    gold:{background:C.gold,color:C.dark,padding:"13px 26px",fontSize:14},
    ghost:{background:C.light,color:C.mid,padding:"11px 22px",fontSize:14},
    blue:{background:C.delivery,color:C.white,padding:"13px 26px",fontSize:14},
    green:{background:C.green,color:C.white,padding:"13px 26px",fontSize:14},
  };
  return <button onClick={disabled?undefined:onClick} style={{...base,...v[variant],...style}} onMouseEnter={e=>{if(!disabled)e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"}}>{children}</button>;
}

function Badge({status}){
  const m={nouveau:{bg:"#FFF3CD",c:"#856404",l:"Nouveau"},"en cours":{bg:"#CCE5FF",c:"#004085",l:"En cours"},livré:{bg:"#D4EDDA",c:"#155724",l:"Livré"},assigné:{bg:"#E8D5FF",c:"#5B21B6",l:"Assigné"}};
  const s=m[status]||m.nouveau;
  return <span style={{background:s.bg,color:s.c,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700}}>{s.l}</span>;
}

function Input({label,value,onChange,placeholder,type="text",prefix}){
  const[focus,setFocus]=useState(false);
  return(
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>{label}</div>}
      <div style={{display:"flex",borderRadius:12,border:`2px solid ${focus?C.terra:C.border}`,overflow:"hidden",transition:"border 0.2s",background:C.white}}>
        {prefix&&<div style={{padding:"12px 14px",background:C.light,fontSize:14,color:C.mid,borderRight:`1px solid ${C.border}`,flexShrink:0}}>{prefix}</div>}
        <input value={value} onChange={onChange} placeholder={placeholder} type={type}
          style={{flex:1,padding:"12px 14px",border:"none",outline:"none",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.dark,background:"transparent"}}
          onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
      </div>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────
function Landing({onVendeur,onLivreur}){
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.dark,minHeight:"100vh"}}>
      <style>{FONTS}</style>
      {/* Nav */}
      <nav style={{padding:"0 6%",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.white}11`}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,color:C.white,letterSpacing:-1}}>
          Jaayma<span style={{color:C.terra}}>.</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" onClick={onLivreur} style={{fontSize:13,padding:"8px 16px"}}>🛵 Je suis livreur</Btn>
          <Btn onClick={onVendeur} style={{fontSize:13,padding:"8px 16px"}}>Créer ma boutique</Btn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{padding:"80px 6%",maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
        <div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${C.gold}22`,borderRadius:20,padding:"6px 16px",marginBottom:24,fontSize:12,fontWeight:700,color:C.gold,border:`1px solid ${C.gold}33`}}>
            🇸🇳 La plateforme e-commerce du Sénégal
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(38px,5vw,60px)",lineHeight:1.1,color:C.white,margin:"0 0 20px",fontWeight:900}}>
            Vends en ligne.<br/><span style={{color:C.terra}}>En 3 minutes.</span><br/>Sans agence.
          </h1>
          <p style={{fontSize:16,color:`${C.white}88`,lineHeight:1.8,marginBottom:32,maxWidth:440}}>
            Crée ta boutique, reçois tes commandes sur WhatsApp, et coordonne tes livreurs — tout depuis un seul endroit.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <Btn onClick={onVendeur} style={{fontSize:15,padding:"15px 30px"}}>🚀 Créer ma boutique — Gratuit</Btn>
            <Btn variant="secondary" onClick={onLivreur} style={{color:C.white,borderColor:`${C.white}44`,fontSize:15,padding:"15px 30px"}}>🛵 Espace livreur</Btn>
          </div>
          <div style={{display:"flex",gap:28,marginTop:32}}>
            {[["2 300+","boutiques"],["98%","satisfaction"],["0 FCFA","pour démarrer"]].map(([n,l])=>(
              <div key={l}>
                <div style={{fontSize:20,fontWeight:900,color:C.terra,fontFamily:"'Playfair Display',serif"}}>{n}</div>
                <div style={{fontSize:11,color:`${C.white}55`}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Flow diagram */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {icon:"👤",color:"#7C3AED",title:"Client commande",sub:"Choisit, paie via Wave ou Orange Money"},
            {icon:"📲",color:C.terra,title:"Vendeur notifié",sub:"WhatsApp + SMS instantané avec détails"},
            {icon:"🛵",color:C.delivery,title:"Livreur assigné",sub:"Reçoit l'adresse et les infos sur WhatsApp"},
            {icon:"✅",color:C.green,title:"Livraison confirmée",sub:"Client reçoit message personnalisé du vendeur"},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:14,background:`${C.white}06`,borderRadius:14,padding:"14px 18px",border:`1px solid ${C.white}0A`}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${s.color}22`,border:`2px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{s.icon}</div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:C.white}}>{s.title}</div>
                <div style={{fontSize:12,color:`${C.white}55`}}>{s.sub}</div>
              </div>
              {i<3&&<div style={{marginLeft:"auto",color:`${C.white}22`,fontSize:18}}>↓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div style={{padding:"60px 6%",borderTop:`1px solid ${C.white}11`}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:32,color:C.white,textAlign:"center",marginBottom:36,fontWeight:900}}>Des prix honnêtes</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {[
              {name:"Démarrage",price:"Gratuit",features:["Boutique en ligne","10 produits max","Notifs WhatsApp","Lien personnalisé"],highlighted:false},
              {name:"Commerçant",price:"4 900 FCFA/mois",features:["Produits illimités","Livreurs intégrés","Wave + Orange Money","Stats avancées","Domaine .sn"],highlighted:true},
              {name:"Business",price:"14 900 FCFA/mois",features:["Multi-boutiques","API livreurs","Support prioritaire","Facturation auto"],highlighted:false},
            ].map((p,i)=>(
              <div key={i} style={{background:p.highlighted?C.terra:`${C.white}06`,borderRadius:20,padding:24,border:`1px solid ${p.highlighted?C.terra:C.white+"11"}`,transform:p.highlighted?"scale(1.03)":"none"}}>
                <div style={{fontSize:12,fontWeight:700,color:p.highlighted?`${C.white}CC`:`${C.white}55`,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{p.name}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:C.white,marginBottom:16}}>{p.price}</div>
                {p.features.map(f=>(<div key={f} style={{fontSize:13,color:p.highlighted?C.white:`${C.white}77`,marginBottom:8,display:"flex",gap:8}}>
                  <span style={{color:p.highlighted?C.gold:C.terra}}>✓</span>{f}
                </div>))}
                <Btn onClick={onVendeur} variant={p.highlighted?"gold":"ghost"} style={{width:"100%",justifyContent:"center",marginTop:16,fontSize:13}}>{p.highlighted?"Choisir ce plan":"Commencer"}</Btn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INSCRIPTION VENDEUR (ultra simple) ──────────────────────────
function InscriptionVendeur({onComplete}){
  const[phone,setPhone]=useState("");
  const[nom,setNom]=useState("");
  const[lien,setLien]=useState("");
  const[lienError,setLienError]=useState("");

  function handleNom(v){
    setNom(v);
    setLien(v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""));
  }

  function handleLien(v){
    const clean=v.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    setLien(clean);
    if(clean.length<3)setLienError("Minimum 3 caractères");
    else setLienError("");
  }

  const valid=phone.length>=9&&nom.length>=2&&lien.length>=3;

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.dark,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{FONTS}</style>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:C.white,marginBottom:32,letterSpacing:-1}}>
        Jaayma<span style={{color:C.terra}}>.</span>
      </div>

      <div style={{background:C.white,borderRadius:24,padding:36,width:"100%",maxWidth:440,boxShadow:`0 20px 60px rgba(0,0,0,0.3)`}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:C.dark,marginBottom:4,fontWeight:900}}>Crée ta boutique</h2>
        <p style={{color:C.gray,fontSize:13,marginBottom:28}}>3 informations, c'est tout. 🚀</p>

        {/* Téléphone */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Ton numéro WhatsApp</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,background:C.light,fontSize:14,color:C.mid,flexShrink:0,fontWeight:600}}>🇸🇳 +221</div>
            <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} placeholder="77 000 00 00" type="tel" maxLength={9}
              style={{flex:1,padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,outline:"none",fontSize:15,fontFamily:"'DM Sans',sans-serif",color:C.dark}}
              onFocus={e=>e.target.style.borderColor=C.terra} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
        </div>

        {/* Nom boutique */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Nom de ta boutique</div>
          <input value={nom} onChange={e=>handleNom(e.target.value)} placeholder="Ex : Mariama Mode, Boutique Diallo..."
            style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,outline:"none",fontSize:15,fontFamily:"'DM Sans',sans-serif",color:C.dark,boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=C.terra} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>

        {/* Lien personnalisé */}
        <div style={{marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Ton lien personnalisé</div>
          <div style={{display:"flex",borderRadius:12,border:`2px solid ${lienError?C.terra:C.border}`,overflow:"hidden",background:C.white}}>
            <div style={{padding:"12px 12px",background:C.light,fontSize:12,color:C.gray,borderRight:`1px solid ${C.border}`,flexShrink:0,display:"flex",alignItems:"center",fontWeight:600}}>jaayma.sn/</div>
            <input value={lien} onChange={e=>handleLien(e.target.value)} placeholder="mariama-mode"
              style={{flex:1,padding:"12px 12px",border:"none",outline:"none",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.terra,fontWeight:700,background:"transparent"}}/>
          </div>
          {lienError&&<div style={{fontSize:11,color:C.terra,marginTop:4}}>{lienError}</div>}
          {lien&&!lienError&&<div style={{fontSize:11,color:C.green,marginTop:4}}>✓ jaayma.sn/{lien}</div>}
        </div>

        {/* Info */}
        <div style={{background:`${C.green}11`,borderRadius:12,padding:"10px 14px",marginBottom:20,border:`1px solid ${C.green}22`}}>
          <div style={{fontSize:12,color:C.green,lineHeight:1.6}}>
            📲 Tu recevras tes notifications de commandes sur le <strong>+221 {phone||"..."}</strong>
          </div>
        </div>

        <Btn onClick={()=>valid&&onComplete({phone,nom,lien})} disabled={!valid} style={{width:"100%",justifyContent:"center",fontSize:15,padding:"15px"}}>
          🚀 Créer ma boutique →
        </Btn>

        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:C.gray}}>
          Gratuit • Pas de carte bancaire requise
        </div>
      </div>
    </div>
  );
}

// ─── INSCRIPTION LIVREUR (simple) ────────────────────────────────
function InscriptionLivreur({onComplete}){
  const[phone,setPhone]=useState("");
  const[nom,setNom]=useState("");
  const[zone,setZone]=useState("");
  const zones=["Dakar Plateau","Médina","Parcelles Assainies","Guédiawaye","Pikine","Rufisque","Thiès","Autre"];

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.dark,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{FONTS}</style>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:C.white,marginBottom:32,letterSpacing:-1}}>
        Jaayma<span style={{color:C.terra}}>.</span>
      </div>
      <div style={{background:C.white,borderRadius:24,padding:36,width:"100%",maxWidth:440}}>
        <div style={{width:52,height:52,borderRadius:14,background:C.deliveryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:16}}>🛵</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:C.dark,marginBottom:4,fontWeight:900}}>Espace Livreur</h2>
        <p style={{color:C.gray,fontSize:13,marginBottom:24}}>Inscris-toi pour recevoir des missions de livraison.</p>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Ton prénom et nom</div>
          <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex : Moussa Diallo"
            style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,outline:"none",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.dark,boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=C.delivery} onBlur={e=>e.target.style.borderColor=C.border}/>
        </div>

        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>Numéro WhatsApp</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,background:C.light,fontSize:14,color:C.mid,flexShrink:0,fontWeight:600}}>🇸🇳 +221</div>
            <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} placeholder="77 000 00 00" type="tel"
              style={{flex:1,padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,outline:"none",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:C.dark}}
              onFocus={e=>e.target.style.borderColor=C.delivery} onBlur={e=>e.target.style.borderColor=C.border}/>
          </div>
        </div>

        <div style={{marginBottom:24}}>
          <div style={{fontSize:12,fontWeight:700,color:C.mid,marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Zone de livraison</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {zones.map(z=>(
              <button key={z} onClick={()=>setZone(z)}
                style={{padding:"10px 12px",borderRadius:10,border:`2px solid ${zone===z?C.delivery:C.border}`,background:zone===z?C.deliveryLight:C.white,color:zone===z?C.delivery:C.mid,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {z}
              </button>
            ))}
          </div>
        </div>

        <Btn variant="blue" onClick={()=>nom&&phone&&zone&&onComplete({nom,phone,zone})} disabled={!nom||!phone||!zone}
          style={{width:"100%",justifyContent:"center",fontSize:15,padding:"15px"}}>
          🛵 Rejoindre Jaayma →
        </Btn>
      </div>
    </div>
  );
}

// ─── DASHBOARD VENDEUR ────────────────────────────────────────────
function DashboardVendeur({store,onPreview}){
  const[tab,setTab]=useState("commandes");
  const[orders,setOrders]=useState(DEMO_ORDERS);
  const[products,setProducts]=useState(DEMO_PRODUCTS);
  const[selectedOrder,setSelectedOrder]=useState(null);
  const[showAddProduct,setShowAddProduct]=useState(false);
  const[newP,setNewP]=useState({name:"",price:"",stock:"",image:"📦"});
  const[toast,setToast]=useState(null);

  function showToast(msg){setToast(msg);setTimeout(()=>setToast(null),3000)}

  function assignerLivreur(orderId,livreur){
    setOrders(orders.map(o=>o.id===orderId?{...o,livreur:livreur.nom,status:"assigné"}:o));
    showToast(`✅ ${livreur.nom} notifié par WhatsApp !`);
    setSelectedOrder(null);
  }

  function envoyerMessage(orderId,message){
    setOrders(orders.map(o=>o.id===orderId?{...o,message,status:"en cours"}:o));
    showToast("📲 Message envoyé au client !");
    setSelectedOrder(null);
  }

  function addProduct(){
    if(!newP.name||!newP.price)return;
    setProducts([...products,{id:Date.now(),name:newP.name,price:parseInt(newP.price),stock:parseInt(newP.stock)||0,image:newP.image,orders:0}]);
    setNewP({name:"",price:"",stock:"",image:"📦"});
    setShowAddProduct(false);
    showToast("✅ Produit ajouté !");
  }

  const totalRevenu=orders.reduce((s,o)=>s+o.montant,0);
  const tabs=[{id:"commandes",label:"🛒 Commandes"},{id:"produits",label:"📦 Produits"},{id:"livreurs",label:"🛵 Livreurs"}];

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100vh",display:"flex"}}>
      <style>{FONTS}</style>
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:1000,background:C.dark,color:C.white,borderRadius:14,padding:"14px 20px",fontSize:14,fontWeight:600,boxShadow:"0 8px 30px rgba(0,0,0,0.2)"}}>{toast}</div>}

      {/* Modal commande */}
      {selectedOrder&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <OrderModal order={selectedOrder} livreurs={DEMO_LIVREURS} onAssign={assignerLivreur} onMessage={envoyerMessage} onClose={()=>setSelectedOrder(null)}/>
        </div>
      )}

      {/* Sidebar */}
      <div style={{width:220,background:C.dark,flexShrink:0,display:"flex",flexDirection:"column",padding:"24px 0"}}>
        <div style={{padding:"0 20px 20px",borderBottom:`1px solid ${C.white}11`}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:C.white,letterSpacing:-1}}>
            Jaayma<span style={{color:C.terra}}>.</span>
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{padding:"16px 16px 0"}}>
          <div style={{background:`${C.white}08`,borderRadius:12,padding:14,marginBottom:16}}>
            <div style={{fontSize:11,color:`${C.white}55`,marginBottom:4}}>REVENUS</div>
            <div style={{fontSize:20,fontWeight:800,color:C.gold,fontFamily:"'Playfair Display',serif"}}>{totalRevenu.toLocaleString()} <span style={{fontSize:11}}>FCFA</span></div>
          </div>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",background:tab===t.id?`${C.terra}33`:"transparent",color:tab===t.id?C.white:`${C.white}66`,fontSize:13,fontWeight:tab===t.id?700:400,fontFamily:"'DM Sans',sans-serif",marginBottom:2,borderLeft:`3px solid ${tab===t.id?C.terra:"transparent"}`,transition:"all 0.15s"}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{margin:"auto 12px 12px"}}>
          <div style={{background:`${C.white}08`,borderRadius:12,padding:12,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:8,background:store?.color||C.terra,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{store?.logo||"🏪"}</div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{store?.nom||"Ma Boutique"}</div>
                <div style={{fontSize:10,color:C.green}}>● jaayma.sn/{store?.lien||"ma-boutique"}</div>
              </div>
            </div>
            <Btn variant="gold" onClick={onPreview} style={{width:"100%",justifyContent:"center",padding:"8px",fontSize:11}}>👁 Voir ma boutique</Btn>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,overflow:"auto",padding:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,color:C.dark,fontWeight:900,margin:0}}>
            {tab==="commandes"&&"Mes commandes"}
            {tab==="produits"&&"Mes produits"}
            {tab==="livreurs"&&"Mes livreurs"}
          </h1>
          {tab==="produits"&&<Btn onClick={()=>setShowAddProduct(true)}>+ Ajouter</Btn>}
        </div>

        {/* COMMANDES */}
        {tab==="commandes"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {orders.map(o=>(
              <div key={o.id} style={{background:C.white,borderRadius:16,padding:18,border:`1px solid ${C.border}`,display:"flex",gap:14,alignItems:"center"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:700,color:C.dark}}>{o.client}</span>
                    <span style={{fontSize:11,color:C.gray}}>{o.id}</span>
                    <Badge status={o.status}/>
                  </div>
                  <div style={{fontSize:13,color:C.mid}}>{o.article}</div>
                  <div style={{display:"flex",gap:16,marginTop:4,fontSize:11,color:C.gray}}>
                    <span>📅 {o.date}</span>
                    <span>💳 {o.payment}</span>
                    {o.livreur&&<span>🛵 {o.livreur}</span>}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.dark,marginBottom:8}}>{o.montant.toLocaleString()} FCFA</div>
                  {o.status==="nouveau"&&(
                    <Btn onClick={()=>setSelectedOrder(o)} style={{fontSize:12,padding:"8px 14px"}}>Gérer →</Btn>
                  )}
                  {o.status==="assigné"&&(
                    <Btn onClick={()=>setSelectedOrder(o)} variant="ghost" style={{fontSize:12,padding:"8px 14px"}}>Envoyer msg</Btn>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUITS */}
        {tab==="produits"&&(
          <>
            {showAddProduct&&(
              <div style={{background:C.white,borderRadius:16,padding:24,marginBottom:16,border:`2px solid ${C.terra}22`}}>
                <div style={{fontWeight:700,color:C.dark,marginBottom:14}}>➕ Nouveau produit</div>
                <input value={newP.name} onChange={e=>setNewP({...newP,name:e.target.value})} placeholder="Nom du produit"
                  style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:C.dark,boxSizing:"border-box",marginBottom:10}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <input value={newP.price} onChange={e=>setNewP({...newP,price:e.target.value})} placeholder="Prix FCFA" type="number"
                    style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:C.dark}}/>
                  <input value={newP.stock} onChange={e=>setNewP({...newP,stock:e.target.value})} placeholder="Stock" type="number"
                    style={{padding:"10px 14px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:C.dark}}/>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <Btn variant="ghost" onClick={()=>setShowAddProduct(false)} style={{flex:1,justifyContent:"center"}}>Annuler</Btn>
                  <Btn onClick={addProduct} style={{flex:2,justifyContent:"center"}}>Ajouter ✓</Btn>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {products.map(p=>(
                <div key={p.id} style={{background:C.white,borderRadius:14,padding:16,border:`1px solid ${C.border}`,display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:48,height:48,borderRadius:12,background:C.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{p.image}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.dark,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{fontSize:14,fontWeight:800,color:C.terra}}>{p.price.toLocaleString()} FCFA</div>
                    <div style={{fontSize:11,color:p.stock>5?C.green:"#e67e22",fontWeight:600}}>Stock: {p.stock}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LIVREURS */}
        {tab==="livreurs"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {DEMO_LIVREURS.map(l=>(
              <div key={l.id} style={{background:C.white,borderRadius:14,padding:18,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:C.deliveryLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🛵</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.dark}}>{l.nom}</div>
                  <div style={{fontSize:12,color:C.gray}}>📍 {l.zone} · 📱 {l.telephone}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,fontWeight:700,color:l.disponible?C.green:"#e67e22",background:l.disponible?"#D4EDDA":"#FFF3CD",borderRadius:20,padding:"3px 10px"}}>
                    {l.disponible?"● Disponible":"○ Occupé"}
                  </span>
                </div>
              </div>
            ))}
            <div style={{background:`${C.delivery}11`,borderRadius:14,padding:16,border:`1px dashed ${C.delivery}44`,textAlign:"center"}}>
              <div style={{fontSize:14,color:C.delivery,fontWeight:600}}>+ Ajouter un livreur partenaire</div>
              <div style={{fontSize:12,color:C.gray,marginTop:4}}>Invite tes livreurs habituels sur Jaayma</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL GESTION COMMANDE ───────────────────────────────────────
function OrderModal({order,livreurs,onAssign,onMessage,onClose}){
  const[step,setStep]=useState("detail"); // detail | livreur | message
  const[message,setMessage]=useState(`Salam ${order.client} ! Merci pour votre commande.\n\nArticle : ${order.article}\nMontant : ${order.montant.toLocaleString()} FCFA\nDélai de livraison : 2-3 heures\n\nNous vous contacterons à l'arrivée. Baraka !`);

  return(
    <div style={{background:C.white,borderRadius:24,width:"100%",maxWidth:480,maxHeight:"80vh",overflow:"auto",padding:28}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:C.dark}}>{order.id}</div>
          <div style={{fontSize:13,color:C.gray}}>{order.client} · {order.article}</div>
        </div>
        <button onClick={onClose} style={{background:C.light,border:"none",borderRadius:"50%",width:32,height:32,cursor:"pointer",fontSize:16}}>×</button>
      </div>

      {step==="detail"&&(
        <>
          <div style={{background:C.light,borderRadius:14,padding:16,marginBottom:16}}>
            {[["Client",order.client],["Téléphone",order.clientPhone],["Article",order.article],["Montant",order.montant.toLocaleString()+" FCFA"],["Adresse",order.adresse],["Paiement",order.payment]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                <span style={{color:C.gray,fontWeight:600}}>{k}</span>
                <span style={{color:C.dark,fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="blue" onClick={()=>setStep("livreur")} style={{flex:1,justifyContent:"center",fontSize:13}}>🛵 Assigner livreur</Btn>
            <Btn onClick={()=>setStep("message")} style={{flex:1,justifyContent:"center",fontSize:13}}>📲 Msg client</Btn>
          </div>
        </>
      )}

      {step==="livreur"&&(
        <>
          <div style={{fontWeight:700,color:C.dark,marginBottom:14}}>Choisir un livreur</div>
          {livreurs.map(l=>(
            <div key={l.id} onClick={()=>l.disponible&&onAssign(order.id,l)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,border:`2px solid ${l.disponible?C.border:C.border}`,marginBottom:8,cursor:l.disponible?"pointer":"default",opacity:l.disponible?1:0.5,background:l.disponible?C.white:C.light,transition:"all 0.15s"}}
              onMouseEnter={e=>{if(l.disponible)e.currentTarget.style.borderColor=C.delivery}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border}}>
              <div style={{fontSize:24}}>🛵</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.dark}}>{l.nom}</div>
                <div style={{fontSize:12,color:C.gray}}>📍 {l.zone}</div>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:l.disponible?C.green:"#e67e22",background:l.disponible?"#D4EDDA":"#FFF3CD",borderRadius:20,padding:"3px 10px"}}>
                {l.disponible?"Disponible":"Occupé"}
              </span>
            </div>
          ))}
          <Btn variant="ghost" onClick={()=>setStep("detail")} style={{marginTop:8,fontSize:13}}>← Retour</Btn>
        </>
      )}

      {step==="message"&&(
        <>
          <div style={{fontWeight:700,color:C.dark,marginBottom:8}}>Message au client</div>
          <div style={{fontSize:12,color:C.gray,marginBottom:12}}>Ce message sera envoyé par WhatsApp à {order.client}</div>
          <textarea value={message} onChange={e=>setMessage(e.target.value)}
            style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`2px solid ${C.border}`,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.dark,minHeight:160,resize:"vertical",boxSizing:"border-box",lineHeight:1.6,outline:"none"}}
            onFocus={e=>e.target.style.borderColor=C.terra} onBlur={e=>e.target.style.borderColor=C.border}/>
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <Btn variant="ghost" onClick={()=>setStep("detail")} style={{flex:1,justifyContent:"center",fontSize:13}}>← Retour</Btn>
            <Btn onClick={()=>onMessage(order.id,message)} style={{flex:2,justifyContent:"center",fontSize:13}}>📲 Envoyer →</Btn>
          </div>
        </>
      )}
    </div>
  );
}

// ─── DASHBOARD LIVREUR ────────────────────────────────────────────
function DashboardLivreur({livreur}){
  const[missions]=useState([
    {id:"CMD-0041",vendeur:"Mariama Mode",client:"Marième Diallo",article:"Boubou brodé premium",adresse:"Rue 10, Médina, Dakar",montant:45000,status:"nouveau",heure:"14:32"},
    {id:"CMD-0039",vendeur:"Boutique Diallo",client:"Aïssatou Ba",article:"Encens thiouraye x3",adresse:"Pikine Tally Bou Mak",montant:10500,status:"en cours",heure:"18:45"},
  ]);

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100vh"}}>
      <style>{FONTS}</style>
      {/* Header */}
      <div style={{background:C.delivery,padding:"20px 24px",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:48,height:48,borderRadius:14,background:`${C.white}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>🛵</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:20,color:C.white}}>Jaayma Livreur</div>
          <div style={{fontSize:12,color:`${C.white}CC`}}>{livreur?.nom||"Moussa Diallo"} · {livreur?.zone||"Dakar Plateau"}</div>
        </div>
        <div style={{marginLeft:"auto",background:`${C.white}22`,borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:700,color:C.white}}>
          ● Disponible
        </div>
      </div>

      <div style={{padding:20}}>
        <div style={{fontWeight:700,color:C.dark,fontSize:15,marginBottom:14}}>📦 Mes missions ({missions.length})</div>
        {missions.map(m=>(
          <div key={m.id} style={{background:C.white,borderRadius:16,padding:18,marginBottom:10,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:C.dark}}>{m.client}</div>
                <div style={{fontSize:12,color:C.gray}}>{m.article} · {m.vendeur}</div>
              </div>
              <Badge status={m.status}/>
            </div>
            <div style={{background:C.light,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
              <div style={{fontSize:12,color:C.mid,fontWeight:600}}>📍 {m.adresse}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <a href={`https://wa.me/221${m.client}`}
                style={{flex:1,padding:"10px",borderRadius:10,background:"#25D366",color:C.white,fontSize:12,fontWeight:700,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                📲 Contacter client
              </a>
              <button style={{flex:1,padding:"10px",borderRadius:10,background:C.delivery,color:C.white,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                ✅ Confirmer livraison
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BOUTIQUE CLIENT ──────────────────────────────────────────────
function BoutiqueClient({store,onBack}){
  const[cart,setCart]=useState([]);
  const[view,setView]=useState("store");
  const[form,setForm]=useState({nom:"",phone:"",payment:""});
  function addToCart(p){setCart(prev=>{const e=prev.find(i=>i.id===p.id);return e?prev.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i):[...prev,{...p,qty:1}]})}
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const count=cart.reduce((s,i)=>s+i.qty,0);
  const sc=store?.color||C.terra;

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.cream,minHeight:"100vh",maxWidth:480,margin:"0 auto"}}>
      <style>{FONTS}</style>
      <div style={{background:sc,padding:"18px 18px 0"}}>
        <button onClick={onBack} style={{background:`${C.white}22`,border:"none",borderRadius:20,padding:"5px 12px",color:C.white,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>← Retour</button>
        <div style={{display:"flex",alignItems:"center",gap:12,paddingBottom:18}}>
          <div style={{width:50,height:50,borderRadius:14,background:`${C.white}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🏪</div>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:19,color:C.white}}>{store?.nom||"Mariama Mode"}</div>
            <div style={{fontSize:11,color:`${C.white}BB`}}>jaayma.sn/{store?.lien||"mariama-mode"}</div>
          </div>
          {count>0&&<button onClick={()=>setView("cart")} style={{marginLeft:"auto",background:C.white,border:"none",borderRadius:20,padding:"7px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:sc}}>🛒 {count}</button>}
        </div>
      </div>

      {view==="store"&&(
        <div style={{padding:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {DEMO_PRODUCTS.map(p=>(
              <div key={p.id} style={{background:C.white,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <div style={{background:C.light,height:90,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44}}>{p.image}</div>
                <div style={{padding:10}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.dark,marginBottom:3}}>{p.name}</div>
                  <div style={{fontSize:13,fontWeight:800,color:sc,marginBottom:8}}>{p.price.toLocaleString()} FCFA</div>
                  <button onClick={()=>addToCart(p)} style={{width:"100%",padding:"7px",borderRadius:8,border:"none",background:sc,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ Ajouter</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:16,padding:14,background:C.white,borderRadius:12,border:`1px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:12,color:C.gray,marginBottom:8,fontWeight:600}}>PAIEMENTS ACCEPTÉS</div>
            <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
              {["📱 Wave","🟠 Orange Money","🚚 Livraison"].map(m=>(<span key={m} style={{background:C.light,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600,color:C.mid}}>{m}</span>))}
            </div>
          </div>
        </div>
      )}

      {view==="cart"&&(
        <div style={{padding:14}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.dark,marginBottom:14}}>Mon panier</h3>
          {cart.map(item=>(
            <div key={item.id} style={{background:C.white,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{fontSize:24}}>{item.image}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.dark}}>{item.name}</div>
                <div style={{fontSize:12,color:sc,fontWeight:800}}>{(item.price*item.qty).toLocaleString()} FCFA</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))} style={{width:26,height:26,borderRadius:"50%",background:C.light,border:"none",cursor:"pointer",fontWeight:700}}>-</button>
                <span style={{fontSize:14,fontWeight:700}}>{item.qty}</span>
                <button onClick={()=>addToCart(item)} style={{width:26,height:26,borderRadius:"50%",background:sc,border:"none",cursor:"pointer",fontSize:14,color:C.white,fontWeight:700}}>+</button>
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <Btn variant="ghost" onClick={()=>setView("store")} style={{flex:1,justifyContent:"center",fontSize:13}}>← Retour</Btn>
            <button onClick={()=>setView("checkout")} style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:sc,color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Commander ({total.toLocaleString()} FCFA) →</button>
          </div>
        </div>
      )}

      {view==="checkout"&&(
        <div style={{padding:14}}>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:C.dark,marginBottom:14}}>Finaliser</h3>
          <input value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} placeholder="Votre nom complet"
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:C.dark,boxSizing:"border-box",marginBottom:10}}/>
          <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Téléphone WhatsApp"
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:C.dark,boxSizing:"border-box",marginBottom:10}}/>
          <input placeholder="Adresse de livraison"
            style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`2px solid ${C.border}`,fontSize:14,outline:"none",fontFamily:"'DM Sans',sans-serif",color:C.dark,boxSizing:"border-box",marginBottom:14}}/>
          <div style={{marginBottom:14}}>
            {["📱 Wave","🟠 Orange Money","🚚 Paiement à la livraison"].map(m=>(
              <button key={m} onClick={()=>setForm({...form,payment:m})}
                style={{display:"block",width:"100%",padding:"12px 14px",marginBottom:8,borderRadius:10,border:`2px solid ${form.payment===m?sc:C.border}`,background:form.payment===m?`${sc}11`:C.white,color:form.payment===m?sc:C.mid,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
                {m}
              </button>
            ))}
          </div>
          <button disabled={!form.nom||!form.phone||!form.payment} onClick={()=>setView("confirmed")}
            style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:!form.nom||!form.phone||!form.payment?C.border:sc,color:C.white,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ✓ Confirmer la commande
          </button>
        </div>
      )}

      {view==="confirmed"&&(
        <div style={{padding:32,textAlign:"center"}}>
          <div style={{fontSize:64,marginBottom:16}}>🎉</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:C.dark,marginBottom:12}}>Commande confirmée !</h2>
          <div style={{background:C.white,borderRadius:16,padding:18,marginBottom:20,textAlign:"left",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:C.gray,marginBottom:10}}>VOUS ALLEZ RECEVOIR</div>
            <div style={{fontSize:13,color:C.mid,lineHeight:1.8}}>
              📲 Un message WhatsApp du vendeur avec les détails<br/>
              🛵 Une notification quand le livreur est en route<br/>
              ✅ Une confirmation à la livraison
            </div>
          </div>
          <button onClick={()=>{setView("store");setCart([]);setForm({nom:"",phone:"",payment:""})}}
            style={{background:sc,border:"none",borderRadius:12,padding:"13px 26px",color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Retour à la boutique
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────
export default function App(){
  const[screen,setScreen]=useState("landing");
  const[storeData,setStoreData]=useState(null);
  const[livreurData,setLivreurData]=useState(null);

  return(
    <>
      {screen==="landing"&&<Landing onVendeur={()=>setScreen("inscription-vendeur")} onLivreur={()=>setScreen("inscription-livreur")}/>}
      {screen==="inscription-vendeur"&&<InscriptionVendeur onComplete={d=>{setStoreData(d);setScreen("dashboard-vendeur")}}/>}
      {screen==="inscription-livreur"&&<InscriptionLivreur onComplete={d=>{setLivreurData(d);setScreen("dashboard-livreur")}}/>}
      {screen==="dashboard-vendeur"&&<DashboardVendeur store={storeData} onPreview={()=>setScreen("boutique-client")}/>}
      {screen==="dashboard-livreur"&&<DashboardLivreur livreur={livreurData}/>}
      {screen==="boutique-client"&&<BoutiqueClient store={storeData} onBack={()=>setScreen("dashboard-vendeur")}/>}
    </>
  );
}
