import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

const DrawCanvas = forwardRef(function DrawCanvas({ onPathUpdate, width, height }, ref) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const points    = useRef([]);

  useImperativeHandle(ref, () => ({
    clear() {
      points.current = [];
      redraw();
      onPathUpdate([]);
    },
  }));

  const getXY = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / r.width;
    const scaleY = canvas.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * scaleX,
      y: (src.clientY - r.top)  * scaleY,
    };
  };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle grid
    ctx.strokeStyle = 'rgba(26,26,20,0.05)';
    ctx.lineWidth = 1;
    const step = 48;
    for (let x = 0; x <= canvas.width; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Centre crosshair hint (only when no points)
    if (points.current.length === 0) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      ctx.strokeStyle = 'rgba(26,26,20,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 16, cy); ctx.lineTo(cx + 16, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy + 16); ctx.stroke();
    }

    if (points.current.length < 2) return;

    // Draw smooth path
    ctx.beginPath();
    ctx.moveTo(points.current[0].x, points.current[0].y);
    for (let i = 1; i < points.current.length - 2; i++) {
      const xc = (points.current[i].x + points.current[i+1].x) / 2;
      const yc = (points.current[i].y + points.current[i+1].y) / 2;
      ctx.quadraticCurveTo(points.current[i].x, points.current[i].y, xc, yc);
    }
    const last = points.current[points.current.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.strokeStyle = '#1a1a14';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Sample points as small dots
    const sampled = points.current.filter((_, i) => i % 10 === 0);
    sampled.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(26,26,20,0.25)';
      ctx.fill();
    });
  }, []);

  const onStart = useCallback((e) => {
  e.preventDefault();
  drawing.current = true;
  const { x, y } = getXY(e, canvasRef.current);
  points.current.push({ x, y });
  }, []);

  const onMove = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const { x, y } = getXY(e, canvasRef.current);
    const last = points.current[points.current.length - 1];
    if (Math.hypot(x - last.x, y - last.y) > 3) {
      points.current.push({ x, y });
      redraw();
    }
  }, [redraw]);

  const onEnd = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    if (points.current.length > 8) {
      onPathUpdate([...points.current]);
    }
  }, [onPathUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('mousedown',  onStart);
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mouseup',    onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive:false });
    canvas.addEventListener('touchmove',  onMove,  { passive:false });
    canvas.addEventListener('touchend',   onEnd);
    redraw();
    return () => {
      canvas.removeEventListener('mousedown',  onStart);
      canvas.removeEventListener('mousemove',  onMove);
      canvas.removeEventListener('mouseup',    onEnd);
      canvas.removeEventListener('mouseleave', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove',  onMove);
      canvas.removeEventListener('touchend',   onEnd);
    };
  }, [onStart, onMove, onEnd, redraw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display:'block', width:'100%', height:'100%', touchAction:'none' }}
    />
  );
});

export default DrawCanvas;