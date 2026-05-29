import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);
  const pos  = useRef({ x:-100, y:-100 });
  const lag  = useRef({ x:-100, y:-100 });
  const raf  = useRef(null);

  useEffect(() => {
    const mv = e => { pos.current = { x:e.clientX, y:e.clientY }; };
    window.addEventListener('mousemove', mv, { passive:true });

    const attach = () => {
      document.querySelectorAll('a,button,[data-hover]').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
      });
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList:true, subtree:true });

    const loop = () => {
      lag.current.x += (pos.current.x - lag.current.x) * 0.09;
      lag.current.y += (pos.current.y - lag.current.y) * 0.09;
      if (dot.current)
        dot.current.style.transform = `translate(${pos.current.x}px,${pos.current.y}px) translate(-50%,-50%)`;
      if (ring.current)
        ring.current.style.transform = `translate(${lag.current.x}px,${lag.current.y}px) translate(-50%,-50%)`;
      raf.current = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('mousemove', mv); mo.disconnect(); };
  }, []);

  return (
    <>
      <div ref={dot} style={{ position:'fixed',top:0,left:0,zIndex:9999,width:10,height:10,borderRadius:'50%',background:'#1a1a14',pointerEvents:'none',transition:'width .18s,height .18s' }} />
      <div ref={ring} style={{ position:'fixed',top:0,left:0,zIndex:9998,width:36,height:36,borderRadius:'50%',border:'1.5px solid rgba(26,26,20,0.4)',pointerEvents:'none',transition:'width .35s,height .35s,opacity .25s' }} />
      <style>{`
        body.ch div[style*="9999"] { width:36px!important; height:36px!important; }
        body.ch div[style*="9998"] { opacity:0!important; }
      `}</style>
    </>
  );
}