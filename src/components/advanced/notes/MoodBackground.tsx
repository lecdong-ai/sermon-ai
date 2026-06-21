'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { NoteType } from '@/lib/advanced/notesData'

interface Palette {
  from: string
  via: string
  to: string
  accent: string
  hue: number
}

const BASE = '#04060f'
const MOOD_PALETTES: Record<NoteType | 'default', Palette> = {
  default:      { from: BASE, via: BASE, to: BASE, accent: '#6366f1', hue: 220 },
  insight:      { from: BASE, via: BASE, to: BASE, accent: '#10b981', hue: 160 },
  research:     { from: BASE, via: BASE, to: BASE, accent: '#3b82f6', hue: 220 },
  application:  { from: BASE, via: BASE, to: BASE, accent: '#8b5cf6', hue: 270 },
  question:     { from: BASE, via: BASE, to: BASE, accent: '#f59e0b', hue: 40 },
  pastoral:     { from: BASE, via: BASE, to: BASE, accent: '#f43f5e', hue: 340 },
  illustration: { from: BASE, via: BASE, to: BASE, accent: '#06b6d4', hue: 190 },
  warning:      { from: BASE, via: BASE, to: BASE, accent: '#ef4444', hue: 0 },
  word:         { from: BASE, via: BASE, to: BASE, accent: '#ec4899', hue: 320 },
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
  hue: number
}

interface MoodBackgroundProps {
  type: NoteType | 'default'
  active?: boolean
}

export default function MoodBackground({ type, active = true }: MoodBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number>(0)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })

  const palette = useMemo(() => MOOD_PALETTES[type] || MOOD_PALETTES.default, [type])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const initCount = 30
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: initCount }, () => ({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.0 + 0.3,
        a: Math.random() * 0.2 + 0.15,
        hue: Math.random() * 20 - 10,
      }))
    }

    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(40, now - last)
      last = now
      ctx.clearRect(0, 0, width, height)

      const ps = particlesRef.current
      const m = mouseRef.current

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i]
        p.x += p.vx * dt * 0.05
        p.y += p.vy * dt * 0.05
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        if (m.active) {
          const dx = p.x - m.x
          const dy = p.y - m.y
          const dist = Math.hypot(dx, dy)
          if (dist < 120) {
            const force = (1 - dist / 120) * 0.3
            p.x += (dx / dist) * force
            p.y += (dy / dist) * force
          }
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        grad.addColorStop(0, `hsla(${palette.hue}, 70%, 65%, ${p.a})`)
        grad.addColorStop(1, 'hsla(0, 0%, 0%, 0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.active = true
    }
    const onLeave = () => { mouseRef.current.active = false }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [palette.hue])

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden transition-all duration-700"
      style={{
        background: `radial-gradient(ellipse at top left, ${palette.from} 0%, ${palette.via} 45%, ${palette.to} 100%)`,
      }}
    >
      <div
        className="absolute -top-20 -left-20 w-[320px] h-[320px] rounded-full blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${palette.accent}1a 0%, transparent 70%)`,
          opacity: active ? 0.35 : 0.12,
        }}
      />
      <div
        className="absolute -bottom-24 -right-20 w-[360px] h-[360px] rounded-full blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${palette.accent}0d 0%, transparent 70%)`,
          opacity: active ? 0.25 : 0.08,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: active ? 0.6 : 0.2 }}
      />
    </div>
  )
}
