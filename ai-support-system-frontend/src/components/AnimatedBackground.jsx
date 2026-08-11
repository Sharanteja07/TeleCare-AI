import React, { useEffect, useRef } from 'react';

/**
 * AnimatedBackground — full-page fixed layer with:
 *  - Cursor-following soft glow
 *  - Floating particles
 *  - AI grid pattern
 *  - Radial nebula lights
 */
const AnimatedBackground = () => {
  const cursorRef = useRef(null);
  const particlesRef = useRef([]);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Smooth cursor glow follow
  useEffect(() => {
    const handleMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMove, { passive: true });

    const animate = () => {
      const lerp = 0.08;
      currentPos.current.x += (mouseRef.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (mouseRef.current.y - currentPos.current.y) * lerp;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${currentPos.current.x}px`;
        cursorRef.current.style.top  = `${currentPos.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      {/* Base gradient background */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: -3,
          background: 'linear-gradient(135deg, #070B18 0%, #0D1224 50%, #070B18 100%)',
        }}
      />

      {/* AI Grid */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: -2,
          backgroundImage: `
            linear-gradient(rgba(59,183,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,183,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
        }}
      />

      {/* Radial glow top-right */}
      <div
        style={{
          position: 'fixed', zIndex: -2,
          width: 900, height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,183,255,0.06) 0%, transparent 70%)',
          top: -300, right: -300,
          pointerEvents: 'none',
          animation: 'float 12s ease-in-out infinite',
        }}
      />

      {/* Radial glow bottom-left */}
      <div
        style={{
          position: 'fixed', zIndex: -2,
          width: 700, height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,139,255,0.05) 0%, transparent 70%)',
          bottom: -200, left: -200,
          pointerEvents: 'none',
          animation: 'float 16s ease-in-out infinite reverse',
        }}
      />

      {/* Cursor glow */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: 500,
          height: 500,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          background: 'radial-gradient(circle, rgba(59,183,255,0.06) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          willChange: 'left, top',
        }}
      />

      {/* Static particles */}
      <ParticleField />
    </>
  );
};

const ParticleField = React.memo(() => {
  const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 1.5 + Math.random() * 2.5,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 12 + Math.random() * 18,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <>
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: `${p.left}%`,
            bottom: '-10px',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: `rgba(59,183,255,${p.opacity})`,
            boxShadow: `0 0 ${p.size * 3}px rgba(59,183,255,0.6)`,
            pointerEvents: 'none',
            zIndex: -1,
            animation: `particleFloat ${p.duration}s ${p.delay}s linear infinite`,
          }}
        />
      ))}
    </>
  );
});

export default AnimatedBackground;
