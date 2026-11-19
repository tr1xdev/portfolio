import { useEffect, useRef } from 'react'

/**
 * Hero oscilloscope trace. The idle signal is a slow packet burst drifting
 * across the screen; the visitor's cursor acts as a probe and injects a
 * decaying ring wherever it moves. Scrolling adds jitter.
 * The path is updated outside React, so there are no re-renders per frame.
 */
const W = 1200
const H = 40
const MID = H / 2
const N = 300

function square(u: number) {
  return Math.sin(u) >= 0 ? 1 : -1
}

function trace(t: number, px: number, energy: number) {
  let d = ''
  for (let i = 0; i <= N; i++) {
    const x = i / N
    const u = (((x - t * 0.06) % 1) + 1) % 1
    let y = 0
    if (u > 0.34 && u < 0.46) y += square((u - 0.34) * Math.PI * 2 * 24) * 14
    else if (u > 0.62 && u < 0.645) y -= 8
    if (px >= 0 && energy > 0.002) {
      const dx = x - px
      const env = Math.exp(-(dx * dx) / 0.0018)
      y += Math.sin(dx * 520 - t * 18) * 17 * energy * env
    }
    y = Math.max(-18, Math.min(18, y))
    d += `${i ? 'L' : 'M'}${(x * W).toFixed(1)} ${(MID - y).toFixed(1)}`
  }
  return d
}

export function Scope() {
  const path = useRef<SVGPathElement>(null)

  useEffect(() => {
    const el = path.current
    const svg = el?.ownerSVGElement
    if (!el || !svg) return

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('d', trace(0, -1, 0))
      return
    }

    let px = -1
    let energy = 0
    let lastScroll = window.scrollY
    let raf = 0
    let visible = true
    const t0 = performance.now()

    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect()
      px = (e.clientX - r.left) / r.width
      if (Math.abs(e.clientY - (r.top + r.height / 2)) < 260) {
        energy = Math.min(1, energy + Math.hypot(e.movementX, e.movementY) / 90)
      }
    }
    const onScroll = () => {
      energy = Math.min(1, energy + Math.abs(window.scrollY - lastScroll) / 300)
      lastScroll = window.scrollY
      if (px < 0) px = 0.5
    }
    const frame = (now: number) => {
      energy *= 0.955
      el.setAttribute('d', trace((now - t0) / 1000, px, energy))
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(frame)
    })

    io.observe(svg)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div className="relative mt-[clamp(20px,3vw,32px)]" aria-hidden="true">
      <svg className="block h-10 w-full fill-none" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <line x1="0" x2={W} y1={MID} y2={MID} className="stroke-line [stroke-dasharray:2_6] [stroke-width:1] [vector-effect:non-scaling-stroke]" />
        <path ref={path} d={trace(0, -1, 0)} className="stroke-signal [stroke-width:1.5] [vector-effect:non-scaling-stroke] [stroke-linejoin:round]" />
      </svg>
      <span className="mono pointer-events-none absolute -top-1 left-0 text-[10px] tracking-[0.12em] text-ink-3 uppercase max-phone:hidden">CH1 · probe = cursor</span>
      <span className="mono pointer-events-none absolute -top-1 right-0 text-[10px] tracking-[0.12em] text-ink-3 uppercase max-phone:hidden">2V/div · 5ms</span>
    </div>
  )
}
