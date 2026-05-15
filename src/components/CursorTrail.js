import React, { useEffect, useRef } from 'react';

const CursorTrail = () => {
  const canvasRef = useRef(null);
  const points = useRef([]);
  const MAX_POINTS = 25; 

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      points.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update points
      for (let i = 0; i < points.current.length; i++) {
        points.current[i].age += 1;
        if (points.current[i].age > MAX_POINTS) {
          points.current.splice(i, 1);
          i--;
        }
      }

      if (points.current.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'lighter'; // Makes it glow without getting muddy

        for (let i = 1; i < points.current.length; i++) {
          const p = points.current[i];
          const prev = points.current[i - 1];
          const alpha = (1 - p.age / MAX_POINTS);
          
          // Outer Soft Glow
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212, 163, 115, ${alpha * 0.08})`; // Even dimmer
          ctx.lineWidth = (MAX_POINTS - p.age) * 0.6; 
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Inner Sharp Core
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212, 163, 115, ${alpha * 0.25})`; // Dimmer core
          ctx.lineWidth = (MAX_POINTS - p.age) * 0.2;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10000,
        filter: 'blur(3px)', // Small blur for softness, no more mud!
        opacity: 0.9
      }}
    />
  );
};

export default CursorTrail;
