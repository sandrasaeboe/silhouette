import React, { useState, useCallback, useRef } from 'react';
import './index.css';
import Cursor from './components/Cursor';
import DrawCanvas from './components/DrawCanvas';
import TypeRenderer from './components/TypeRenderer';
import MetricDisplay from './components/MetricDisplay';
import { analysePath, metricsToType } from './hooks/pathAnalysis';

const PRESET_WORDS = ['FORM', 'DRAPE', 'BODY', 'VOID', 'SEAM'];

const C = {
  bg:    '#f5f3ef',
  ink:   '#0f0f0a',
  ink40: 'rgba(15,15,10,0.65)',
  ink20: 'rgba(15,15,10,0.45)',
  ink15: 'rgba(15,15,10,0.15)',
  ink10: 'rgba(15,15,10,0.1)',
  ink06: 'rgba(15,15,10,0.06)',
  ink03: 'rgba(15,15,10,0.03)',
};

export default function App() {
  const [metrics,  setMetrics]  = useState(null);
  const [typeProps,setTypeProps] = useState(null);
  const [word,     setWord]     = useState('FORM');
  const [input,    setInput]    = useState('FORM');
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef(null);

  const onPathUpdate = useCallback((pts) => {
    if (pts.length < 8) { setMetrics(null); setTypeProps(null); setHasDrawn(false); return; }
    const m = analysePath(pts);
    const t = metricsToType(m);
    setMetrics(m); setTypeProps(t); setHasDrawn(true);
  }, []);

  const handleClear = () => {
    canvasRef.current?.clear();
    setMetrics(null); setTypeProps(null); setHasDrawn(false);
  };

  const applyWord = () => {
    const clean = input.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
    if (clean) setWord(clean);
  };

  return (
    <>
      <Cursor />

      {/* ── Nav — like the reference header ── */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        display:'grid', gridTemplateColumns:'1fr auto 1fr',
        alignItems:'center',
        padding:'0 32px', height:48,
        background:'rgba(237,234,227,0.96)',
        borderBottom:`1px solid ${C.ink10}`,
        backdropFilter:'blur(12px)',
      }}>
        {/* Left */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:C.ink40, fontFamily:'monospace' }}>
            Design Tool
          </span>
          <span style={{ display:'inline-block', width:28, height:1, background:C.ink20 }} />
          <span style={{ fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:C.ink40, fontFamily:'monospace' }}>
            Silhouette
          </span>
        </div>

        {/* Centre — index like "01 —— 25" in the reference */}
        <div style={{ display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
          <span style={{ fontSize:12, fontFamily:'monospace', color:C.ink20, letterSpacing:'0.1em' }}>01</span>
          <span style={{ display:'inline-block', width:32, height:1, background:C.ink20 }} />
          <span style={{ fontSize:12, fontFamily:'monospace', color:C.ink20, letterSpacing:'0.1em' }}>Sandra Sæbø</span>
        </div>

        {/* Right */}
        <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:16 }}>
          <a href="https://portfolio-sandrasaeboe.vercel.app"
            style={{ fontSize:12, letterSpacing:'0.16em', textTransform:'uppercase', color:C.ink40, fontFamily:'monospace', transition:'color .2s' }}
            onMouseEnter={e=>e.target.style.color=C.ink} onMouseLeave={e=>e.target.style.color=C.ink40}>
            ← Portfolio
          </a>
        </div>
      </nav>

      <main style={{ paddingTop:48 }}>

        {/* ── Big label + huge type — like the Adobe reference ── */}
        <div style={{ padding:'64px 32px 48px', borderBottom:`1px solid ${C.ink10}` }}>

          {/* Small label above */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <span style={{ fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', color:C.ink40, fontFamily:'monospace' }}>Generative Typography</span>
            <span style={{ display:'inline-block', width:24, height:1, background:C.ink20 }} />
            <span style={{ fontSize:12, letterSpacing:'0.2em', textTransform:'uppercase', color:C.ink20, fontFamily:'monospace' }}>2024</span>
          </div>

          {/* Title — huge, runs off the bottom like "ADOBE" in the reference */}
          <div style={{ overflow:'hidden', lineHeight:0.78, marginBottom:0 }}>
            <h1 style={{
              fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',
              fontWeight:700,
              fontSize:'clamp(80px,18vw,240px)',
              letterSpacing:'-0.05em',
              lineHeight:0.8,
              textTransform:'uppercase',
              color:C.ink,
              display:'block',
            }}>
              Silhouette
            </h1>
          </div>
        </div>

        {/* ── Subtitle strip ── */}
        <div style={{ padding:'20px 32px', borderBottom:`1px solid ${C.ink10}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <p style={{ fontSize:15, color:C.ink40, letterSpacing:'0.04em', fontWeight:300 }}>
            Draw a shape. The algorithm picks a typeface that matches its character.
          </p>
          <span style={{ fontSize:12, fontFamily:'monospace', color:C.ink20, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            Canvas · Spring Physics · Variable Fonts
          </span>
        </div>

        {/* ── Type output — warm bg, black type, like reference ── */}
        {/* ── Type output — warm bg, black type, like reference ── */}
        <div style={{
          background: C.bg,
          borderBottom:`1px solid ${C.ink10}`,
          minHeight:200,
          display:'flex', alignItems:'center',
          position:'relative', overflow:'hidden',
        }}>
          {/* Subtle grid texture */}
          <div style={{
            position:'absolute', inset:0,
            backgroundImage:`linear-gradient(${C.ink03} 1px, transparent 1px), linear-gradient(90deg, ${C.ink03} 1px, transparent 1px)`,
            backgroundSize:'32px 32px',
            pointerEvents:'none',
          }} />

          {!hasDrawn ? (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2, pointerEvents:'none' }}>
              <p style={{ fontSize:13, letterSpacing:'0.2em', textTransform:'uppercase', color:C.ink20, fontFamily:'monospace' }}>
                Draw a silhouette below
              </p>
            </div>
          ) : (
            <div style={{ width:'100%', height:200, position:'relative', zIndex:2 }}>
              <TypeRenderer metrics={metrics} word={word} lightMode={true} />
            </div>
          )}

          {hasDrawn && (
            <div style={{ position:'absolute', bottom:14, right:20, display:'flex', alignItems:'center', gap:8, zIndex:3 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:C.ink20, display:'inline-block', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:12, letterSpacing:'0.16em', textTransform:'uppercase', color:C.ink20, fontFamily:'monospace' }}>Live</span>
            </div>
          )}
        </div>

        {/* ── Controls ── */}
        <div style={{
          padding:'14px 32px',
          borderBottom:`1px solid ${C.ink10}`,
          display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', justifyContent:'space-between',
          background:'rgba(26,26,20,0.02)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:C.ink40, fontFamily:'monospace' }}>Word</span>
            <input value={input} onChange={e=>setInput(e.target.value.toUpperCase().slice(0,10))} onKeyDown={e=>e.key==='Enter'&&applyWord()} placeholder="FORM"
              style={{ background:'transparent', border:'none', borderBottom:`1px solid ${C.ink20}`, color:C.ink, fontFamily:'monospace', fontSize:12, letterSpacing:'0.12em', padding:'3px 0', width:90, outline:'none', textTransform:'uppercase' }} />
            
          </div>

          <div style={{ display:'flex', gap:6 }}>
            {PRESET_WORDS.map(w=>(
              <button key={w} onClick={()=>{setWord(w);setInput(w);}} data-hover
                style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 12px', border:`1px solid ${word===w?C.ink40:C.ink10}`, color:word===w?C.ink:C.ink40, background:word===w?C.ink06:'transparent', transition:'all .2s', fontFamily:'monospace' }}>
                {w}
              </button>
            ))}
          </div>

          <button onClick={handleClear} data-hover style={{ fontSize:12, letterSpacing:'0.14em', textTransform:'uppercase', padding:'4px 12px', border:`1px solid ${C.ink10}`, color:C.ink40, transition:'all .2s', fontFamily:'monospace' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.ink40;e.currentTarget.style.color=C.ink}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.ink10;e.currentTarget.style.color=C.ink40}}>Clear</button>
        </div>

        {/* ── Canvas + metrics ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', minHeight:500, borderBottom:`1px solid ${C.ink10}` }}>

          {/* Drawing canvas */}
          <div style={{ borderRight:`1px solid ${C.ink10}`, position:'relative' }}>
            {!hasDrawn && (
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', zIndex:1 }}>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:15, letterSpacing:'0.16em', textTransform:'uppercase', color:C.ink20, marginBottom:8, fontFamily:'monospace' }}>Draw here</p>
                  <p style={{ fontSize:12, color:C.ink20, fontFamily:'monospace' }}>Any shape — garment, body, gesture</p>
                </div>
              </div>
            )}
            <DrawCanvas ref={canvasRef} onPathUpdate={onPathUpdate} width={900} height={600} />
          </div>

          {/* Metrics */}
          <div style={{ padding:'28px 24px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <MetricDisplay metrics={metrics} typeProps={typeProps} />
            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${C.ink10}` }}>
              <p style={{ fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:C.ink20, marginBottom:14, fontFamily:'monospace' }}>Mapping</p>
              {[['Curvature','Font weight'],['Drape','Italic angle'],['Tension','Scale'],['Asymmetry','Font choice']].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
                  <span style={{ fontSize:13, color:C.ink40, fontFamily:'monospace' }}>{k}</span>
                  <span style={{ fontSize:13, color:C.ink20, fontFamily:'monospace' }}>→ {v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding:'20px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <span style={{ fontSize:12, fontFamily:'monospace', color:C.ink20, letterSpacing:'0.1em' }}>Silhouette — Sandra Sæbø — 2024</span>
          <span style={{ fontSize:12, fontFamily:'monospace', color:C.ink20, letterSpacing:'0.1em' }}>sandrasaebo.vercel.app</span>
        </div>
      </main>
    </>
  );
}