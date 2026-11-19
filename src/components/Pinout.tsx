import { useEffect, useState } from 'react'
import { groups, pins, profile } from '../data/profile'
import type { GroupId } from '../data/profile'

const W = 760
const BODY = { x: 250, y: 30, w: 260, h: 500 }
const SIDE = 11
const STEP = BODY.h / (SIDE + 1)

// die exposed in decap mode; pads mirror the package pin order
const DIE = { x: 330, y: 120, w: 100, h: 320 }
const DSTEP = DIE.h / (SIDE + 1)
const padY = (i: number) => (i < SIDE ? DIE.y + DSTEP * (i + 1) : DIE.y + DIE.h - DSTEP * (i - SIDE + 1))

const svgMono = 'font-mono'
const groupClass: Record<GroupId, string> = { lang: 'g-lang', arch: 'g-arch', data: 'g-data', infra: 'g-infra' }

const legendItem =
  'group grid min-h-11 cursor-pointer grid-cols-[14px_1fr_auto] items-center gap-3 rounded-lg border border-line bg-transparent px-3.5 text-left [transition:border-color_0.15s,background_0.15s] hover:border-ink aria-pressed:border-(--g) aria-pressed:bg-paper-3 aria-pressed:text-ink aria-pressed:shadow-[inset_3px_0_0_var(--g)] max-tight:min-h-10 max-tight:text-sm'

function pinPos(index: number) {
  // index 0..21 → pin number index+1
  if (index < SIDE) {
    return { side: 'L' as const, y: BODY.y + STEP * (index + 1) }
  }
  const fromBottom = index - SIDE
  return { side: 'R' as const, y: BODY.y + BODY.h - STEP * (fromBottom + 1) }
}

const groupIds = Object.keys(groups) as GroupId[]

export function Pinout() {
  const [selected, setSelected] = useState(0)
  const [filter, setFilter] = useState<GroupId | null>(null)
  const [decap, setDecap] = useState(false)

  useEffect(() => {
    const toggle = () => setDecap((d) => !d)
    window.addEventListener('chip:decap', toggle)
    return () => window.removeEventListener('chip:decap', toggle)
  }, [])
  const pin = pins[selected]

  const dim = (g: GroupId) => filter !== null && filter !== g

  return (
    <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(280px,1fr)] items-start gap-12 max-tight:grid-cols-[1fr] max-tight:gap-8">
      <div className="max-tight:hidden">
        <svg className="block h-auto w-full overflow-visible" viewBox={`0 0 ${W} 560`} role="img" aria-label={`${profile.partNo} pin configuration diagram`}>
          {/* body */}
          <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx="6" className="fill-[#19191c] stroke-[rgba(238,236,231,0.14)] [stroke-width:1.5]" />
          <path
            d={`M${BODY.x + BODY.w / 2 - 20} ${BODY.y} a20 20 0 0 0 40 0`}
            className="fill-paper"
          />
          <circle cx={BODY.x + 22} cy={BODY.y + 22} r="5" className="fill-ink-3 opacity-[0.85]" />
          <g className={`transition-opacity duration-500 ${decap ? 'opacity-0' : ''}`}>
          <text x={W / 2} y={262} className="fill-ink font-display text-[40px] font-extrabold font-stretch-[125%] tracking-[-0.01em]" textAnchor="middle">
            {profile.partNo}
          </text>
          <text x={W / 2} y={292} className={`fill-signal ${svgMono} text-[13px] tracking-[0.22em]`} textAnchor="middle">
            SYSTEMS CORE
          </text>
          <text x={W / 2} y={318} className={`${svgMono} fill-ink-2 text-[13px] tracking-[0.08em]`} textAnchor="middle">
            {profile.handle} · 2026
          </text>
          </g>

          <g className={`transition-opacity duration-500 ${decap ? '' : 'pointer-events-none opacity-0'}`} aria-hidden={!decap}>
            <rect x={DIE.x} y={DIE.y} width={DIE.w} height={DIE.h} rx="2" className="fill-paper-3 stroke-line-strong [stroke-width:1]" />
            {groupIds.map((g, k) => {
              const bh = (DIE.h - 16) / groupIds.length
              const y = DIE.y + 8 + k * bh
              const on = g === pin.group
              return (
                <g key={g} className={groupClass[g]}>
                  <rect x={DIE.x + 12} y={y + 3} width={DIE.w - 24} height={bh - 6} className={`fill-(--g) stroke-(--g) [stroke-width:1] transition-[fill-opacity] duration-200 ${on ? '[fill-opacity:0.32]' : '[fill-opacity:0.06]'}`} />
                  <text x={DIE.x + DIE.w / 2} y={y + bh / 2 + 4} textAnchor="middle" className={`${svgMono} text-[10px] tracking-[0.14em] ${on ? 'fill-ink' : 'fill-ink-3'}`}>
                    {groups[g].short}
                  </text>
                </g>
              )
            })}
            <text x={DIE.x + DIE.w / 2} y={DIE.y + DIE.h + 22} textAnchor="middle" className={`${svgMono} fill-ink-3 text-[10px] tracking-[0.14em]`}>
              DIE · {profile.partNo}
            </text>
          </g>

          {pins.map((p, i) => {
            const pos = pinPos(i)
            const isL = pos.side === 'L'
            const active = i === selected
            const legX = isL ? BODY.x - 34 : BODY.x + BODY.w
            return (
              <g
                key={p.signal}
                className={`group ${groupClass[p.group]} cursor-pointer outline-none [transition:opacity_0.2s] focus-visible:outline-none${dim(p.group) ? ' opacity-[0.18]' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={`Pin ${i + 1}: ${p.name}, ${groups[p.group].label}`}
                aria-pressed={active}
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
              >
                <rect x={isL ? 0 : BODY.x + BODY.w} y={pos.y - 17} width={BODY.x} height={34} className="fill-transparent" />
                {decap && (
                  <path
                    d={(() => {
                      const sx = isL ? BODY.x + 38 : BODY.x + BODY.w - 38
                      const ex = isL ? DIE.x : DIE.x + DIE.w
                      const ey = padY(i)
                      const mx = (sx + ex) / 2
                      return `M${sx} ${pos.y}C${mx} ${pos.y} ${mx} ${ey} ${ex} ${ey}`
                    })()}
                    className="fill-none stroke-ink-3 [stroke-opacity:0.45] [stroke-width:1] transition-[stroke] duration-150 group-aria-pressed:stroke-(--g) group-aria-pressed:[stroke-opacity:1] group-aria-pressed:[stroke-width:1.75]"
                  />
                )}
                <rect x={legX} y={pos.y - 7} width={34} height={14} rx="2" className="fill-[#5a5852] transition-[fill] duration-150 group-aria-pressed:fill-(--g) group-focus-visible:fill-(--g)" />
                <text
                  x={isL ? BODY.x + 14 : BODY.x + BODY.w - 14}
                  y={pos.y + 4.5}
                  textAnchor={isL ? 'start' : 'end'}
                  className={`${svgMono} fill-ink-2 text-xs group-aria-pressed:fill-ink`}
                >
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text
                  x={isL ? BODY.x - 48 : BODY.x + BODY.w + 48}
                  y={pos.y + 5}
                  textAnchor={isL ? 'end' : 'start'}
                  className={`${svgMono} fill-ink text-lg font-bold tracking-[0.02em] group-focus-visible:underline`}
                >
                  {p.signal}
                </text>
                <circle
                  cx={isL ? BODY.x - 48 - p.signal.length * 11.2 - 14 : BODY.x + BODY.w + 48 + p.signal.length * 11.2 + 14}
                  cy={pos.y}
                  r="3.5"
                  className="fill-(--g)"
                />
              </g>
            )
          })}
        </svg>
      </div>

      <aside className="sticky top-[92px] grid gap-5 max-tight:static max-tight:hidden">
        <div className="min-h-[196px] rounded-[10px] border border-line-2 bg-paper-2 px-[22px] pt-5 pb-[22px] max-tight:hidden" aria-live="polite">
          <div className="mono flex justify-between text-xs tracking-[0.12em] text-ink-2">
            <span>PIN {String(selected + 1).padStart(2, '0')}</span>
            <span className={`inline-flex items-center gap-2 text-ink before:size-2.5 before:rounded-[2px] before:bg-(--g) before:content-[''] ${groupClass[pin.group]}`}>{groups[pin.group].short}</span>
          </div>
          <p className="mt-[18px] mb-1.5 text-[40px] leading-none font-extrabold font-stretch-[118%] tracking-[-0.03em]">{pin.name}</p>
          <p className="m-0 text-ink-2">{pin.note}</p>
          <p className="mono mt-3.5 mb-0 text-xs tracking-[0.08em] text-ink-3 uppercase">{groups[pin.group].label}</p>
        </div>

        <div className="grid gap-1.5 max-tight:hidden max-tight:grid-cols-[1fr_1fr] max-tight:pointer-events-none max-phone:grid-cols-[1fr]" role="group" aria-label="Filter pins by group">
          {groupIds.map((g) => {
            const count = pins.filter((p) => p.group === g).length
            const on = filter === g
            return (
              <button
                key={g}
                type="button"
                className={`${legendItem} ${groupClass[g]}`}
                aria-pressed={on}
                onClick={() => setFilter(on ? null : g)}
              >
                <span className="swatch" aria-hidden="true" />
                <span>{groups[g].label}</span>
                <span className="mono text-[13px] text-ink-3 group-aria-pressed:text-ink-2">{count}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="mono flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-line bg-transparent px-3.5 text-xs tracking-[0.08em] text-ink-2 uppercase [transition:border-color_0.15s,color_0.15s] hover:border-ink hover:text-ink aria-pressed:border-signal aria-pressed:text-ink"
          aria-pressed={decap}
          onClick={() => setDecap((d) => !d)}
        >
          <span>{decap ? 'Refit the lid' : 'Decap the package'}</span>
          <span className="text-ink-3">x-ray</span>
        </button>
        <p className="mono m-0 text-xs text-ink-3 max-tight:hidden">hover or tab through pins · click a group to isolate it</p>
      </aside>

      <div className="hidden max-tight:block">
        {groupIds.map((g) => (
          <div key={g} className={`border-t border-line py-[18px] ${groupClass[g]}`}>
            <h3 className="mono m-0 mb-3 flex items-center gap-2 text-[11px] font-medium tracking-[0.12em] text-ink-2 uppercase">
              <span className="swatch" aria-hidden="true" /> {groups[g].label}
            </h3>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {pins
                .filter((p) => p.group === g)
                .map((p) => (
                  <li key={p.signal} className="rounded-md border border-line-2 px-3 py-[7px] font-semibold" title={p.note}>
                    <span>{p.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
