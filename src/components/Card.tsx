import { useRef } from 'react'
import type { PointerEvent } from 'react'
import { profile } from '../data/profile'

function Barcode({ text }: { text: string }) {
  const bars: { x: number; w: number }[] = []
  let x = 0
  for (const ch of text + profile.partNo) {
    const code = ch.charCodeAt(0)
    for (let b = 0; b < 7; b++) {
      const w = (code >> b) & 1 ? 2.4 : 1
      bars.push({ x, w })
      x += w + 1.6
    }
  }
  return (
    <svg className="barcode" viewBox={`0 0 ${x} 30`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={30} />
      ))}
    </svg>
  )
}

function Contacts() {
  return (
    <svg className="chip-contacts" viewBox="0 0 60 46" aria-hidden="true">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9d6ce" />
          <stop offset=".45" stopColor="#8f8c85" />
          <stop offset=".55" stopColor="#bdb9b0" />
          <stop offset="1" stopColor="#6f6c66" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="59" height="45" rx="7" fill="url(#steel)" />
      <g stroke="#4a4843" strokeWidth="1" fill="none" opacity=".75">
        <path d="M0 15h18M0 31h18M42 15h18M42 31h18M18 0v46M42 0v46" />
        <rect x="18" y="11" width="24" height="24" rx="4" />
      </g>
    </svg>
  )
}

export function Card({ flipped, onFlip }: { flipped: boolean; onFlip: () => void }) {
  const stage = useRef<HTMLDivElement>(null)
  const raf = useRef(0)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`)
      el.style.setProperty('--ry', `${(x - 0.5) * 22}deg`)
      el.style.setProperty('--gx', `${x * 100}%`)
      el.style.setProperty('--gy', `${y * 100}%`)
    })
  }
  const onLeave = () => {
    const el = stage.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const { links } = profile

  return (
    <div className="card-stage" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className={`card${flipped ? ' is-flipped' : ''}`}>
        <button
          type="button"
          className="card-face card-front"
          onClick={onFlip}
          inert={flipped}
          aria-label="Business card. Flip to see contacts"
        >
          <span className="cf-top">
            <span className="cf-mark">TR1X</span>
            <span className="cf-part mono">{profile.partNo}</span>
          </span>
          <span className="cf-mid">
            <Contacts />
            <span className="cf-wave" aria-hidden="true">
              <svg viewBox="0 0 120 24">
                <path d="M0 12h14l4-9 6 18 6-18 6 18 4-9h14l4-6 4 6h58" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
          </span>
          <span className="cf-bottom">
            <span className="cf-name">{profile.handle}</span>
            <span className="cf-role mono">systems · backend · ml</span>
          </span>
          <span className="card-glare" aria-hidden="true" />
        </button>

        <div className="card-face card-back" inert={!flipped}>
          <div className="cb-head mono">
            <span>CONTACT / {profile.partNo}</span>
            <button type="button" className="cb-flip" onClick={onFlip} aria-label="Flip card back">
              ↺ flip
            </button>
          </div>
          <dl className="cb-list mono">
            <div>
              <dt>github</dt>
              <dd>
                <a href={links.github} target="_blank" rel="noreferrer">
                  {links.github.replace('https://', '')}
                </a>
              </dd>
            </div>
            {links.email && (
              <div>
                <dt>email</dt>
                <dd>
                  <a href={`mailto:${links.email}`}>{links.email}</a>
                </dd>
              </div>
            )}
            {links.telegram && (
              <div>
                <dt>telegram</dt>
                <dd>
                  <a href={links.telegram} target="_blank" rel="noreferrer">
                    {links.telegram.replace('https://', '')}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt>tz</dt>
              <dd>{profile.tzLabel}</dd>
            </div>
            <div>
              <dt>mode</dt>
              <dd>building systems &amp; side projects</dd>
            </div>
          </dl>
          <Barcode text={profile.handle} />
        </div>
      </div>
      <div className="card-shadow" aria-hidden="true" />
      <p className="card-hint mono">
        click card or press <kbd>F</kbd> to flip
      </p>
    </div>
  )
}
