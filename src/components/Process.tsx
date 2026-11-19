import { useEffect, useState } from 'react'
import { useInView, useReducedMotion } from '../hooks'

type Line = { kind: 'note' | 'cmd' | 'out'; text: string }

// Illustrative workflow, one stage per step. No invented metrics.
const STAGES: { step: string; lines: Line[] }[] = [
  {
    step: 'spec',
    lines: [
      { kind: 'note', text: 'contract first: API, schema, failure modes' },
      { kind: 'cmd', text: 'buf lint && buf breaking --against .git#branch=main' },
      { kind: 'out', text: 'contract ok, no breaking changes' },
    ],
  },
  {
    step: 'build',
    lines: [
      { kind: 'note', text: 'small packages, explicit dependencies' },
      { kind: 'cmd', text: 'go build ./... && cargo build --release' },
      { kind: 'out', text: 'build ok' },
    ],
  },
  {
    step: 'test',
    lines: [
      { kind: 'note', text: 'race detector on, edge cases first' },
      { kind: 'cmd', text: 'go test -race ./...' },
      { kind: 'out', text: 'PASS' },
      { kind: 'cmd', text: 'cargo test' },
      { kind: 'out', text: 'test result: ok' },
    ],
  },
  {
    step: 'harden',
    lines: [
      { kind: 'note', text: 'timeouts, retries, backpressure, graceful shutdown' },
      { kind: 'cmd', text: 'go test -bench=. -cpuprofile cpu.out' },
      { kind: 'cmd', text: 'go tool pprof -top cpu.out' },
      { kind: 'note', text: 'find the hot path, fix it, measure again' },
    ],
  },
  {
    step: 'ship',
    lines: [
      { kind: 'cmd', text: 'docker build -t svc:latest .' },
      { kind: 'cmd', text: 'docker compose up -d' },
      { kind: 'out', text: 'healthy, logs and metrics wired' },
    ],
  },
]

const PREFIX: Record<Line['kind'], string> = { note: '#', cmd: '$', out: '›' }
const LINE: Record<Line['kind'], string> = { note: 'text-ink-3 italic', cmd: 'text-ink', out: 'text-[#6fd3a5]' }
const PREFIX_COLOR: Record<Line['kind'], string> = {
  note: 'text-ink-3',
  cmd: 'text-signal-ink',
  out: 'text-[rgba(111,211,165,0.6)]',
}

const termLine = 'm-0 mb-2 grid grid-cols-[16px_1fr] gap-2.5 [overflow-wrap:anywhere] max-tight:grid-cols-[14px_1fr] max-tight:gap-2'
const termDot = 'h-[3px] w-[18px] rounded-[2px] bg-[rgba(238,236,231,0.14)] [transition:background_0.3s,width_0.3s]'

export function Process() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [line, setLine] = useState(0)
  const [chars, setChars] = useState(0)

  const { step, lines } = STAGES[stage]
  const animate = inView && !reduced
  const done = reduced || line >= lines.length

  useEffect(() => {
    if (!animate) return
    let t: number
    if (line >= lines.length) {
      t = window.setTimeout(() => {
        setStage((s) => (s + 1) % STAGES.length)
        setLine(0)
        setChars(0)
      }, 2600)
    } else {
      const cur = lines[line]
      if (chars < cur.text.length) {
        const typed = cur.kind === 'cmd'
        const stepSize = typed ? 1 : cur.kind === 'note' ? 3 : 10
        t = window.setTimeout(() => setChars((c) => c + stepSize), typed ? 26 + Math.random() * 30 : 12)
      } else {
        t = window.setTimeout(() => {
          setLine((l) => l + 1)
          setChars(0)
        }, cur.kind === 'cmd' ? 420 : 240)
      }
    }
    return () => window.clearTimeout(t)
  }, [animate, line, chars, lines])

  const pick = (i: number) => {
    setStage(i)
    setLine(0)
    setChars(0)
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-14 max-tight:grid-cols-[1fr] max-tight:gap-10">
      <div>
        <h3 className="m-0 mb-6 text-process leading-[0.95] font-extrabold font-stretch-[118%] tracking-[-0.035em] [text-wrap:balance]">
          Built to spec<span>.</span> Tested to fail safely<span>.</span>
        </h3>
        <p className="m-0 max-w-[480px] text-[17px] text-ink-2">
          I start from the contract: schemas, failure modes, edge cases. Then I build, measure and harden until the service holds up
          under real load.
        </p>
        <p className="mt-4 max-w-[480px] border-l-2 border-line-strong pl-3.5 text-[15px] text-ink-3">
          AI assistants sit in the toolbox next to the debugger and the profiler. Design decisions stay with me.
        </p>
        <ol className="mono m-0 mt-8 flex list-none flex-wrap p-0 text-[13px] max-tight:flex-nowrap max-tight:overflow-x-auto max-tight:[scrollbar-width:none]" aria-label="Workflow stages">
          {STAGES.map((s, i) => (
            <li key={s.step} className="-mr-px -mb-px m-0 max-tight:flex-[0_0_auto]">
              <button
                type="button"
                className="group flex min-h-11 cursor-pointer items-center gap-2 rounded-none border border-line-2 bg-transparent px-4 mono text-[13px] text-ink-2 [transition:background_0.2s,color_0.2s,border-color_0.2s] hover:bg-paper-3 hover:text-ink aria-pressed:relative aria-pressed:border-signal aria-pressed:bg-signal aria-pressed:font-bold aria-pressed:text-on-signal"
                aria-pressed={i === stage}
                onClick={() => pick(i)}
              >
                <span className="text-[11px] text-signal-ink group-aria-pressed:text-on-signal">{String(i + 1).padStart(2, '0')}</span>
                {s.step}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="overflow-hidden rounded-xl border border-line-2 bg-[#0a0a0b] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]" ref={ref} role="img" aria-label={`Example workflow, stage: ${step}`}>
        <div className="mono flex items-center gap-3.5 border-b border-line px-4 py-3 text-xs text-ink-3" aria-hidden="true">
          <span className="flex gap-1.5">
            <i className="size-2.5 rounded-[50%] bg-[rgba(238,236,231,0.16)]" />
            <i className="size-2.5 rounded-[50%] bg-[rgba(238,236,231,0.16)]" />
            <i className="size-2.5 rounded-[50%] bg-[rgba(238,236,231,0.16)]" />
          </span>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-ink-2">
            workflow <span className="text-ink-3">/</span> {step}
          </span>
          <span className="ml-auto inline-flex items-center gap-2 whitespace-nowrap text-signal-ink">
            <span className="led" /> {String(stage + 1).padStart(2, '0')}/{String(STAGES.length).padStart(2, '0')}
          </span>
        </div>
        <div className="mono min-h-[184px] px-5 pt-5 pb-4 text-sm leading-[1.6] max-tight:min-h-[236px] max-tight:text-[13px]" aria-hidden="true">
          {lines.map((l, i) => {
            if (!done && i > line) return null
            const partial = !done && i === line
            const text = partial ? l.text.slice(0, chars) : l.text
            return (
              <p key={`${stage}-${i}`} className={`${termLine} ${LINE[l.kind]}`}>
                <span className={PREFIX_COLOR[l.kind]}>{PREFIX[l.kind]}</span>
                <span>
                  {text}
                  {partial && <span className="caret" />}
                </span>
              </p>
            )
          })}
          {done && !reduced && (
            <p className={`${termLine} text-ink`}>
              <span className="text-signal-ink">$</span>
              <span>
                <span className="caret" />
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-1.5 px-5 pb-[18px]" aria-hidden="true">
          {STAGES.map((s, i) => (
            <span
              key={s.step}
              data-state={i === stage ? 'on' : i < stage ? 'done' : 'idle'}
              className={`${termDot} data-[state=done]:bg-[rgba(255,90,31,0.4)] data-[state=on]:w-8 data-[state=on]:bg-signal`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
