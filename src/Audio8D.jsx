import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Upload, Download, Music, Play, Square } from "lucide-react";

const DARK_C = {
  obsidian: "#07111F", charcoal: "rgba(255,255,255,0.06)",
  white: "#FFFFFF", sand: "#8899BB", border: "rgba(255,255,255,0.1)",
  terra: "#4E7FFF", green: "#22C55E",
};
const LIGHT_C = {
  obsidian: "#F0F2FF", charcoal: "rgba(255,255,255,0.9)",
  white: "#1F1F1F", sand: "#6A6F83", border: "rgba(90,143,250,0.18)",
  terra: "#5A8FFA", green: "#16A34A",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`;
const G = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse8d{0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,0.5)}70%{box-shadow:0 0 0 16px rgba(168,85,247,0)}}
@keyframes rotate8d{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(90deg) scale(1.05)}50%{transform:rotate(180deg) scale(1)}75%{transform:rotate(270deg) scale(1.05)}100%{transform:rotate(360deg) scale(1)}}
.spin8d{animation:rotate8d 3s linear infinite}
.eightd-btn{transition:all .2s ease}
.eightd-btn:hover{filter:brightness(1.12);transform:translateY(-1px)}
.eightd-btn:active{transform:scale(0.97)}
`;

// Encode AudioBuffer as WAV
function encodeWAV(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const samples = audioBuffer.length;
  const blockAlign = (numChannels * bitDepth) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, str) { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); }
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  return buffer;
}

// Apply 8D effect using OfflineAudioContext
async function apply8D(arrayBuffer, params, onProgress) {
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
  await ctx.close();

  const { rotationSpeed, reverbAmount, bassBoost, stereoWidth } = params;
  const sampleRate = decoded.sampleRate;
  const duration = decoded.duration;
  const numChannels = 2;

  const offlineCtx = new OfflineAudioContext(numChannels, Math.ceil(duration * sampleRate), sampleRate);

  // Source
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;

  // Gain
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = 0.9;

  // Bass boost (low shelf via BiquadFilter)
  const bassFilter = offlineCtx.createBiquadFilter();
  bassFilter.type = "lowshelf";
  bassFilter.frequency.value = 150;
  bassFilter.gain.value = bassBoost;

  // Reverb via ConvolverNode (impulse response generated)
  const convolver = offlineCtx.createConvolver();
  const reverbLen = Math.ceil(sampleRate * 2.5); // 2.5 sec reverb tail
  const reverbBuf = offlineCtx.createBuffer(2, reverbLen, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = reverbBuf.getChannelData(ch);
    for (let i = 0; i < reverbLen; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 3.5);
    }
  }
  convolver.buffer = reverbBuf;

  // Wet/dry for reverb
  const dryGain = offlineCtx.createGain();
  dryGain.gain.value = 1 - reverbAmount * 0.4;
  const wetGain = offlineCtx.createGain();
  wetGain.gain.value = reverbAmount * 0.55;

  // 3D Panner for 8D rotation
  const panner = offlineCtx.createPanner();
  panner.panningModel = "HRTF";
  panner.distanceModel = "linear";
  panner.maxDistance = 10;
  panner.refDistance = 1;
  panner.rolloffFactor = 0;

  // Animate panner position in a circle (LFO)
  const steps = Math.ceil(duration * 60); // 60 keyframes per second
  const stepTime = duration / steps;
  const radius = stereoWidth;
  for (let i = 0; i <= steps; i++) {
    const t = i * stepTime;
    const angle = 2 * Math.PI * rotationSpeed * t;
    panner.positionX.setValueAtTime(radius * Math.sin(angle), t);
    panner.positionY.setValueAtTime(radius * 0.3 * Math.cos(angle * 0.5), t);
    panner.positionZ.setValueAtTime(radius * Math.cos(angle), t);
  }

  // Connect graph: source → bassFilter → [dry path + wet path via convolver] → panner → gain → destination
  source.connect(bassFilter);
  bassFilter.connect(dryGain);
  bassFilter.connect(convolver);
  convolver.connect(wetGain);
  dryGain.connect(panner);
  wetGain.connect(panner);
  panner.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  source.start(0);

  // Render with progress polling
  const renderPromise = offlineCtx.startRendering();
  const startTime = Date.now();
  const poll = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const estimated = duration * 0.6; // rough estimate
    onProgress(Math.min(0.9, elapsed / estimated));
  }, 200);

  const renderedBuffer = await renderPromise;
  clearInterval(poll);
  onProgress(1);

  return renderedBuffer;
}

export default function Audio8D({ onBack, theme }) {
  const C = theme === "dark" ? DARK_C : LIGHT_C;
  const isDark = theme === "dark";

  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // { url, filename }
  const [playing, setPlaying] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [toast, setToast] = useState(null);
  const [params, setParams] = useState({
    rotationSpeed: 0.18,
    reverbAmount: 0.55,
    bassBoost: 3,
    stereoWidth: 3,
  });

  const fileRef = useRef(null);
  const audioRef = useRef(null);
  const previewRef = useRef(null);
  const originalArrayRef = useRef(null);

  function showToast(m) { setToast(m); setTimeout(() => setToast(null), 3000); }

  const handleFileSelect = useCallback((f) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) { showToast("❌ Fichier audio uniquement (MP3, WAV, OGG...)"); return; }
    if (f.size > 100 * 1024 * 1024) { showToast("❌ Fichier trop grand (max 100 MB)"); return; }
    setFile(f);
    setResult(null);
    setProgress(0);
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    const reader = new FileReader();
    reader.onload = (e) => { originalArrayRef.current = e.target.result; };
    reader.readAsArrayBuffer(f);
  }, []);

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    handleFileSelect(f);
  }

  async function convert() {
    if (!originalArrayRef.current || processing) return;
    setProcessing(true);
    setProgress(0);
    setResult(null);
    try {
      const rendered = await apply8D(originalArrayRef.current, params, (p) => setProgress(p));
      const wav = encodeWAV(rendered);
      const blob = new Blob([wav], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setResult({ url, filename: `${baseName}_8D_FawzeyniTV.wav` });
      showToast("✅ Conversion 8D terminée !");
    } catch (e) {
      showToast("❌ Erreur : " + e.message);
    }
    setProcessing(false);
  }

  function togglePreview() {
    if (!audioUrl) return;
    if (!previewRef.current) {
      previewRef.current = new Audio(audioUrl);
      previewRef.current.onended = () => setPreviewPlaying(false);
    }
    if (previewPlaying) { previewRef.current.pause(); setPreviewPlaying(false); }
    else { previewRef.current.play(); setPreviewPlaying(true); }
  }

  function toggleResult() {
    if (!result) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(result.url);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  }

  const ACCENT = "#A855F7";

  const card = {
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 20,
    border: `1px solid ${C.border}`,
    padding: 22,
  };

  const sliderStyle = (color) => ({
    width: "100%",
    accentColor: color,
    cursor: "pointer",
    height: 4,
  });

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: C.obsidian, minHeight: "100vh", transition: "background .35s" }}>
      <style>{FONTS}{G}</style>

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 3000, background: isDark ? "rgba(15,15,20,0.97)" : "#fff", backdropFilter: "blur(20px)", color: C.white, borderRadius: 13, padding: "11px 18px", fontSize: 13, fontWeight: 600, border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "scaleIn .3s ease both" }}>{toast}</div>
      )}

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${isDark ? "#1a0a2e,#2d1054,#1a0a2e" : "#7c3aed,#9333ea,#7c3aed"})`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(168,85,247,0.3)" }}>
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "7px 13px", color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
          <ArrowLeft size={13} /> Retour
        </button>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎧</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>Convertisseur 8D Audio</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1 }}>FAWZEYNI TV · XASSIDA EN 8D</div>
        </div>
        <div style={{ background: "rgba(168,85,247,0.25)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#D8B4FE", border: "1px solid rgba(168,85,247,0.4)", animation: "pulse8d 2s infinite" }}>🎧 8D LIVE</div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 18px 60px" }}>

        {/* UPLOAD ZONE */}
        <div style={{ animation: "fadeUp .4s ease both", marginBottom: 20 }}>
          <input ref={fileRef} type="file" accept="audio/*" onChange={e => handleFileSelect(e.target.files[0])} style={{ display: "none" }} />

          {!file ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              style={{ border: `2px dashed ${ACCENT}55`, borderRadius: 20, padding: "44px 20px", textAlign: "center", cursor: "pointer", background: `rgba(168,85,247,0.04)`, transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = "rgba(168,85,247,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${ACCENT}55`; e.currentTarget.style.background = "rgba(168,85,247,0.04)"; }}>
              <div className="spin8d" style={{ width: 64, height: 64, borderRadius: "50%", background: `rgba(168,85,247,0.15)`, border: `2px solid ${ACCENT}66`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🎧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>Dépose ton fichier xassida ici</div>
              <div style={{ fontSize: 12, color: C.sand }}>MP3, WAV, OGG, M4A · Max 100 MB</div>
              <div style={{ marginTop: 14, display: "inline-block", background: ACCENT, color: "#fff", borderRadius: 10, padding: "9px 22px", fontSize: 12, fontWeight: 700 }}>Choisir un fichier</div>
            </div>
          ) : (
            <div style={{ ...card, borderColor: `${ACCENT}33`, display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: `rgba(168,85,247,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🎵</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                <div style={{ fontSize: 11, color: C.sand, marginTop: 2 }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Audio original</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={togglePreview}
                  style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`, background: previewPlaying ? ACCENT : "transparent", color: previewPlaying ? "#fff" : C.sand, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {previewPlaying ? <Square size={14} /> : <Play size={14} />}
                </button>
                <button onClick={() => { setFile(null); setAudioUrl(null); setResult(null); previewRef.current = null; audioRef.current = null; }}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>×</button>
              </div>
            </div>
          )}
        </div>

        {/* PARAMS */}
        {file && !processing && !result && (
          <div style={{ ...card, marginBottom: 20, animation: "fadeUp .4s ease both .1s" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.sand, letterSpacing: 1, marginBottom: 18 }}>RÉGLAGES DE L'EFFET 8D</div>
            {[
              { key: "rotationSpeed", label: "Vitesse de rotation", min: 0.05, max: 0.5, step: 0.01, unit: `${params.rotationSpeed.toFixed(2)} Hz`, desc: "Lent = spirituel · Rapide = dynamique" },
              { key: "reverbAmount", label: "Réverbération", min: 0, max: 1, step: 0.05, unit: `${Math.round(params.reverbAmount * 100)}%`, desc: "Simule l'espace acoustique de la pièce" },
              { key: "bassBoost", label: "Boost des basses", min: 0, max: 8, step: 0.5, unit: `+${params.bassBoost} dB`, desc: "Renforce les basses fréquences" },
              { key: "stereoWidth", label: "Largeur stéréo", min: 1, max: 6, step: 0.5, unit: `${params.stereoWidth}x`, desc: "Amplitude du mouvement gauche-droite" },
            ].map(({ key, label, min, max, step, unit, desc }) => (
              <div key={key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.white }}>{label}</span>
                    <span style={{ fontSize: 10, color: C.sand, marginLeft: 8 }}>{desc}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{unit}</span>
                </div>
                <input type="range" min={min} max={max} step={step} value={params[key]}
                  onChange={e => setParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                  style={sliderStyle(ACCENT)} />
              </div>
            ))}

            {/* Presets */}
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.sand, letterSpacing: 1, marginBottom: 10 }}>PRESETS RAPIDES</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "🕌 Spirituel", vals: { rotationSpeed: 0.12, reverbAmount: 0.7, bassBoost: 2, stereoWidth: 2.5 } },
                  { label: "🎧 Standard 8D", vals: { rotationSpeed: 0.18, reverbAmount: 0.55, bassBoost: 3, stereoWidth: 3 } },
                  { label: "⚡ Intense", vals: { rotationSpeed: 0.35, reverbAmount: 0.45, bassBoost: 5, stereoWidth: 5 } },
                  { label: "🌙 Nocturne", vals: { rotationSpeed: 0.08, reverbAmount: 0.85, bassBoost: 1, stereoWidth: 2 } },
                ].map(({ label, vals }) => (
                  <button key={label} onClick={() => setParams(vals)}
                    style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${ACCENT}44`, background: "rgba(168,85,247,0.08)", color: ACCENT, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif", transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.08)"; }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONVERT BUTTON */}
        {file && !processing && !result && (
          <button onClick={convert} className="eightd-btn"
            style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${ACCENT},#7c3aed)`, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 8px 32px rgba(168,85,247,0.4)", animation: "fadeUp .4s ease both .2s", letterSpacing: 0.5 }}>
            <span style={{ fontSize: 20 }}>🎧</span> Convertir en 8D Audio
          </button>
        )}

        {/* PROGRESS */}
        {processing && (
          <div style={{ ...card, textAlign: "center", animation: "scaleIn .3s ease both" }}>
            <div className="spin8d" style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${ACCENT},#7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32, boxShadow: `0 0 32px ${ACCENT}66` }}>🎧</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginBottom: 6 }}>Traitement 8D en cours…</div>
            <div style={{ fontSize: 12, color: C.sand, marginBottom: 20 }}>Application de l'effet de spatialisation audio</div>
            <div style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(90,143,250,0.06)", borderRadius: 100, height: 10, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: "100%", borderRadius: 100, background: `linear-gradient(90deg,${ACCENT},#7c3aed)`, width: `${Math.round(progress * 100)}%`, transition: "width .3s ease", boxShadow: `0 0 12px ${ACCENT}88` }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{Math.round(progress * 100)}%</div>
          </div>
        )}

        {/* RESULT */}
        {result && !processing && (
          <div style={{ animation: "scaleIn .4s ease both" }}>
            <div style={{ ...card, borderColor: `${ACCENT}44`, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg,${ACCENT},#7c3aed)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: `0 4px 20px ${ACCENT}55`, animation: "pulse8d 2s infinite" }}>🎧</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 3 }}>✅ Xassida 8D prêt !</div>
                  <div style={{ fontSize: 11, color: C.sand, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.filename}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={toggleResult} className="eightd-btn"
                  style={{ flex: 1, padding: "13px", borderRadius: 12, border: `1.5px solid ${ACCENT}`, background: playing ? ACCENT : "transparent", color: playing ? "#fff" : ACCENT, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  {playing ? <><Square size={14} /> Arrêter</> : <><Play size={14} /> Écouter</>}
                </button>
                <button onClick={download} className="eightd-btn"
                  style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${ACCENT},#7c3aed)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: `0 4px 20px ${ACCENT}44` }}>
                  <Download size={15} /> Télécharger le WAV 8D
                </button>
              </div>
            </div>

            {/* Next step tip */}
            <div style={{ background: "rgba(34,197,94,0.07)", borderRadius: 16, padding: 16, border: "1px solid rgba(34,197,94,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", letterSpacing: 1, marginBottom: 8 }}>ÉTAPE SUIVANTE →</div>
              {["Ouvre CapCut → Importe ce fichier WAV","Ajoute l'image de la Mosquée de Touba en fond","Titre : '🎧 [Nom du Xassida] 8D | Fawzeyni TV'","Exporte en MP4 et uploade sur YouTube"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, fontSize: 12, color: C.sand }}>
                  <span style={{ color: "#22C55E", fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>{s}
                </div>
              ))}
            </div>

            <button onClick={() => { setFile(null); setAudioUrl(null); setResult(null); setProgress(0); previewRef.current = null; audioRef.current = null; }}
              style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.sand, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
              + Convertir un autre xassida
            </button>
          </div>
        )}

        {/* INFO */}
        {!file && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20, animation: "fadeUp .5s ease both .2s" }}>
            {[
              { icon: "🔄", title: "Rotation 3D", desc: "Le son tourne autour de ta tête avec l'effet HRTF" },
              { icon: "🏛️", title: "Réverbération", desc: "Effet de grande salle pour un rendu sacré et immersif" },
              { icon: "🎚️", title: "Paramétrable", desc: "Ajuste la vitesse, la profondeur et les basses" },
              { icon: "📥", title: "Export WAV", desc: "Haute qualité, prêt pour CapCut et YouTube" },
            ].map((f, i) => (
              <div key={i} style={{ ...card, textAlign: "center", padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: C.sand, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
