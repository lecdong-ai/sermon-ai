'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  hue: number;
}

export default function AnimatedSacredBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates with easing
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Generate warm celestial particles (은은한 서재의 촛불 불빛 & 밤하늘의 빛가루)
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isGolden = Math.random() > 0.4;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.8,
        baseRadius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.15), // Gently drift upwards
        alpha: Math.random() * 0.6 + 0.2,
        baseAlpha: Math.random() * 0.5 + 0.25,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
        // 38~48 is warm amber/gold, 220~240 is soft celestial blue
        hue: isGolden ? 42 : 225,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.01;

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // ── 1. Animated Fluid Aurora Gradients ──
      // Aurora 1: Warm Amber / Gold (촛불의 온기 - Left Top)
      const a1X = width * 0.35 + Math.sin(time * 0.7) * 140 + (mouse.x - width / 2) * 0.06;
      const a1Y = height * 0.25 + Math.cos(time * 0.5) * 100 + (mouse.y - height / 2) * 0.06;
      const g1 = ctx.createRadialGradient(a1X, a1Y, 0, a1X, a1Y, Math.max(width, height) * 0.45);
      g1.addColorStop(0, 'rgba(217, 119, 6, 0.14)');
      g1.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)');
      g1.addColorStop(1, 'rgba(10, 14, 26, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Aurora 2: Deep Midnight Indigo (말씀의 깊이 - Right Center)
      const a2X = width * 0.7 + Math.cos(time * 0.6) * 160 - (mouse.x - width / 2) * 0.05;
      const a2Y = height * 0.45 + Math.sin(time * 0.8) * 110 - (mouse.y - height / 2) * 0.05;
      const g2 = ctx.createRadialGradient(a2X, a2Y, 0, a2X, a2Y, Math.max(width, height) * 0.5);
      g2.addColorStop(0, 'rgba(79, 70, 229, 0.12)');
      g2.addColorStop(0.5, 'rgba(59, 130, 246, 0.04)');
      g2.addColorStop(1, 'rgba(10, 14, 26, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);

      // Aurora 3: Soft Ethereal Violet (성령의 은혜 - Bottom Center)
      const a3X = width * 0.5 + Math.sin(time * 0.4 + 2) * 180;
      const a3Y = height * 0.75 + Math.cos(time * 0.5 + 1) * 120;
      const g3 = ctx.createRadialGradient(a3X, a3Y, 0, a3X, a3Y, Math.max(width, height) * 0.48);
      g3.addColorStop(0, 'rgba(147, 51, 234, 0.08)');
      g3.addColorStop(0.5, 'rgba(99, 102, 241, 0.03)');
      g3.addColorStop(1, 'rgba(10, 14, 26, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, width, height);

      // ── 2. Floating Luminous Celestial Particles ──
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx + Math.sin(time * 1.5 + p.phase) * 0.2;
        p.y += p.vy;

        // Subtle twinkling opacity
        p.alpha = p.baseAlpha + Math.sin(time * p.speed * 80 + p.phase) * 0.25;
        p.alpha = Math.max(0.08, Math.min(0.85, p.alpha));

        // Breathing radius
        p.radius = p.baseRadius + Math.sin(time * 2 + p.phase) * 0.5;

        // Wrap around borders seamlessly
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        // Soft Outer Glow Halo
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
        if (p.hue === 42) {
          glow.addColorStop(0, `rgba(251, 191, 36, ${p.alpha * 0.9})`);
          glow.addColorStop(0.4, `rgba(245, 158, 11, ${p.alpha * 0.3})`);
          glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          glow.addColorStop(0, `rgba(165, 180, 252, ${p.alpha * 0.9})`);
          glow.addColorStop(0.4, `rgba(99, 102, 241, ${p.alpha * 0.3})`);
          glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
        }

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core Solid Particle
        ctx.fillStyle = p.hue === 42
          ? `rgba(254, 243, 199, ${p.alpha})`
          : `rgba(238, 242, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0A0E1A]"
      aria-hidden="true"
    >
      {/* Background Animated Canvas (Fluid Aurora + Twinkling Embers) */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-95 transition-opacity duration-1000"
      />

      {/* Gentle Vignette Mask to keep content readable */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-40" />
    </div>
  );
}
