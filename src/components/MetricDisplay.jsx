import React from 'react';

const C = {
  ink:  '#0f0f0a',
  ink50: 'rgba(15,15,10,0.7)',
  ink30: 'rgba(15,15,10,0.55)',
  ink15: 'rgba(15,15,10,0.15)',
};

function Bar({ label, value }) {
  const pct = Math.round(Math.min((value || 0) * 100, 100));
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
        <span style={{ fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:C.ink30, fontFamily:'monospace' }}>{label}</span>
        <span style={{ fontSize:10, fontFamily:'monospace', color:C.ink50 }}>{typeof value === 'number' ? value.toFixed(2) : '—'}</span>
      </div>
      <div style={{ height:1, background:C.ink15 }}>
        <div style={{ height:1, background:C.ink50, width:`${pct}%`, transition:'width .5s cubic-bezier(0.16,1,0.3,1)' }} />
      </div>
    </div>
  );
}

export default function MetricDisplay({ metrics, typeProps }) {
  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:C.ink30, marginBottom:18, fontFamily:'monospace' }}>Silhouette</p>
      <Bar label="Drape"     value={metrics?.drape} />
      <Bar label="Curvature" value={metrics?.curvature} />
      <Bar label="Tension"   value={metrics?.tension} />
      <Bar label="Width"     value={metrics?.widthRatio} />
      <Bar label="Asymmetry" value={metrics?.asymmetry} />
      {typeProps && (
        <>
          <p style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:C.ink30, marginBottom:18, marginTop:24, fontFamily:'monospace' }}>Type</p>
          <Bar label="Weight"  value={typeProps.weight / 900} />
          <Bar label="Stretch" value={typeProps.stretch / 140} />
          <Bar label="Spacing" value={(typeProps.spacing + 0.02) / 0.14} />
        </>
      )}
    </div>
  );
}