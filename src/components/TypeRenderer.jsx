import React, { useRef, useEffect } from 'react';
import { createSpring } from '../hooks/useSpring';

const FONTS = [
  { name:'Playfair Display',    description:'soft · curved · romantic' },
  { name:'Cormorant Garamond',  description:'draped · elegant · tall' },
  { name:'Bebas Neue',          description:'sharp · compressed · structural' },
  { name:'Barlow Condensed',    description:'geometric · tight · minimal' },
  { name:'DM Serif Display',    description:'editorial · balanced · precise' },
  { name:'Anton',               description:'heavy · bold · impactful' },
  { name:'Space Grotesk',       description:'technical · modern · clean' },
];

function pickFont(metrics) {
  if (!metrics) return FONTS[4];
  const { curvature, tension, drape, widthRatio, asymmetry } = metrics;
  if (curvature > 0.6 && tension < 0.4) return FONTS[0];
  if (tension > 0.55 && drape > 0.5)    return FONTS[1];
  if (curvature < 0.3 && tension > 0.45) return FONTS[2];
  if (curvature < 0.35 && drape < 0.45)  return FONTS[3];
  if (asymmetry > 0.55 || (curvature > 0.55 && asymmetry > 0.4)) return FONTS[5];
  if (widthRatio > 0.65 && curvature < 0.45) return FONTS[6];
  return FONTS[4];
}

function pickWeight(metrics, fontName) {
  if (!metrics) return 700;
  if (fontName === 'Bebas Neue' || fontName === 'Anton') return 400;
  return Math.round(300 + metrics.curvature * 500);
}

function pickItalic(metrics, fontName) {
  if (!metrics) return false;
  if (['Bebas Neue','Anton','Space Grotesk','Barlow Condensed'].includes(fontName)) return false;
  return metrics.drape > 0.58 || metrics.asymmetry > 0.55;
}

function makeSpring() { return createSpring(45, 10); }

export default function TypeRenderer({ metrics, word }) {
  const canvasRef  = useRef(null);
  const raf        = useRef(null);
  const fontRef    = useRef(FONTS[4]);
  const metricsRef = useRef(metrics);
  const sizeSpr    = useRef(makeSpring());
  const spaceSpr   = useRef(makeSpring());
  const angleSpr   = useRef(makeSpring());

  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  useEffect(() => {
    if (!metrics) return;
    fontRef.current = pickFont(metrics);
    sizeSpr.current.setTarget(0.72 + metrics.tension * 0.42);
    spaceSpr.current.setTarget((1 - metrics.curvature) * 0.2 - 0.01);
    angleSpr.current.setTarget((metrics.drape - 0.5) * 16 + (metrics.asymmetry - 0.5) * 9);
  }, [metrics]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let last = performance.now();

    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const letters  = (word || 'FORM').split('');
      const m        = metricsRef.current;
      const font     = fontRef.current;
      const weight   = pickWeight(m, font.name);
      const italic   = pickItalic(m, font.name);
      const sizeMul  = sizeSpr.current.step(dt);
      const spacing  = spaceSpr.current.step(dt);
      const angle    = angleSpr.current.step(dt);
      const baseH    = H * 0.65 * sizeMul;
      const fontStr  = `${italic ? 'italic ' : ''}${weight} ${Math.round(baseH)}px '${font.name}', serif`;

      ctx.font = fontStr;

      const widths = letters.map(ch => ctx.measureText(ch).width + baseH * Math.max(spacing, 0.01));
      const totalW = widths.reduce((a, b) => a + b, 0);
      const slant  = angle * Math.PI / 180;

      let x = (W - totalW) / 2;
      const y = H / 2 + baseH * 0.3;

      letters.forEach((ch, i) => {
        ctx.save();
        ctx.transform(1, 0, -Math.tan(slant) * 0.35, 1, x + widths[i] / 2, y);
        ctx.font = fontStr;
        ctx.fillStyle = '#1a1a14';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        x += widths[i];
      });

      // Font label
      ctx.font = `300 11px Helvetica Neue, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${font.name}  ·  ${font.description}`, W - 20, H - 14);

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [word]);

  return (
    <canvas ref={canvasRef} width={900} height={300}
      style={{ display:'block', width:'100%', height:'100%' }} />
  );
}