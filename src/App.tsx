import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { profile, sections } from './data/profile'
import { Pinout } from './components/Pinout'
import { Process } from './components/Process'
import { Work } from './components/Work'
import { Stats } from './components/Stats'
import { CommandPalette } from './components/CommandPalette'
import type { Command } from './components/CommandPalette'
import { StatusBar } from './components/StatusBar'
import { isMac, useActiveSection } from './hooks'

const ids = sections.map((s) => s.id)

const btn =
  'inline-flex min-h-12 cursor-pointer items-center gap-2.5 rounded-lg px-5 font-mono text-sm font-medium no-underline [transition:transform_0.15s,background_0.15s,color_0.15s,border-color_0.15s] active:translate-y-px'
const btnInk = `${btn} border border-ink bg-ink text-paper hover:border-signal hover:bg-signal hover:text-on-signal hover:shadow-[0_8px_28px_-8px_rgba(255,90,31,0.6)]`
const btnLine = `${btn} border border-line-strong bg-transparent hover:border-ink hover:bg-paper-3`

const sectionBase = 'py-24 max-tight:py-[72px] print:break-inside-avoid print:py-8'
const sectionContact = 'pt-24 pb-12 max-tight:pt-[72px] max-tight:pb-[72px] print:break-inside-avoid print:py-8'

const navLink =
  'group rounded-md px-2.5 py-2 text-ink-2 no-underline [transition:color_0.15s,background_0.15s] hover:bg-paper-2 hover:text-ink aria-[current=true]:bg-paper-2 aria-[current=true]:text-ink'
const navNo = 'text-ink-3 group-aria-[current=true]:text-signal-ink'

const specCell = 'pt-4 pr-5 pb-[18px]'
const specCellDivided = `${specCell} border-l border-line pl-5`
const specLabel = 'mono text-[11px] tracking-[0.12em] text-ink-3 uppercase'
const specValue = 'm-0 mt-1.5 flex items-center gap-2.5 text-spec font-bold font-stretch-[112%] tracking-[-0.01em] max-phone:text-[15px]'

function SectionHead({ no, title, aside }: { no: string; title: string; aside?: ReactNode }) {
  return (
    <header className="mb-12 grid grid-cols-[72px_1fr_auto] items-baseline gap-4 border-t-2 border-rule pt-3.5 max-tight:mb-8 max-tight:grid-cols-[auto_1fr]">
      <span className="mono text-[13px] font-bold text-signal-ink">§{no}</span>
      <h2 className="m-0 text-section leading-[1.05] font-extrabold font-stretch-[115%] tracking-[-0.025em]">{title}</h2>
      <span className="mono text-xs tracking-[0.1em] text-ink-3 uppercase max-tight:hidden">
        {aside ?? `${profile.partNo} · datasheet`}
      </span>
    </header>
  )
}

export default function App() {
  const [palette, setPalette] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef(0)
  const active = useActiveSection(ids)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  const copy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text)
        notify(`${label} copied to clipboard`)
      } catch {
        notify('Clipboard unavailable')
      }
    },
    [notify],
  )

  const go = useCallback((id: string) => {
    setMenu(false)
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (id === 'top') window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
    else document.getElementById(id)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((o) => !o)
        return
      }
      if (e.key === 'Escape') setMenu(false)
      const t = e.target as HTMLElement
      if (palette || e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, [contenteditable="true"]')) return
      if (e.key === '/') {
        e.preventDefault()
        setPalette(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [palette])

  // Lock page scroll behind the open mobile menu.
  useEffect(() => {
    document.documentElement.classList.toggle('overflow-hidden', menu)
  }, [menu])

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      ...sections.map((s) => ({
        id: `go-${s.id}`,
        group: 'go to',
        label: `${s.no} · ${s.label}`,
        run: () => go(s.id),
      })),
      { id: 'gh', group: 'open', label: 'GitHub profile', hint: '↗', run: () => window.open(profile.links.github, '_blank', 'noopener') },
      { id: 'copy-gh', group: 'copy', label: 'GitHub URL', run: () => copy(profile.links.github, 'GitHub URL') },
      { id: 'copy-site', group: 'copy', label: 'Link to this site', run: () => copy(profile.site, 'Site URL') },
      { id: 'print', group: 'export', label: 'Print datasheet', run: () => window.print() },
      { id: 'top', group: 'go to', label: '00 · Top', run: () => go('top') },
    ]
    if (profile.links.email) {
      list.splice(6, 0, { id: 'copy-mail', group: 'copy', label: 'Email address', run: () => copy(profile.links.email, 'Email') })
    }
    if (profile.links.telegram) {
      list.splice(6, 0, { id: 'tg', group: 'open', label: 'Telegram', hint: '↗', run: () => window.open(profile.links.telegram, '_blank', 'noopener') })
    }
    return list
  }, [copy, go])

  const current = sections.find((s) => s.id === active)
  const kbd = isMac ? '⌘K' : 'Ctrl K'

  const navLinks = sections.map((s) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      className={navLink}
      aria-current={active === s.id ? 'true' : undefined}
      onClick={(e) => {
        e.preventDefault()
        go(s.id)
      }}
    >
      <span className={navNo}>{s.no}</span> {s.label}
    </a>
  ))

  const mobileLinks = sections.map((s) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      className="group border-b border-line py-3.5 text-ink-2 no-underline aria-[current=true]:text-ink"
      aria-current={active === s.id ? 'true' : undefined}
      onClick={(e) => {
        e.preventDefault()
        go(s.id)
      }}
    >
      <span className={navNo}>{s.no}</span> {s.label}
    </a>
  ))

  return (
    <>
      <a
        className="fixed -top-[60px] left-3 z-[100] rounded-md bg-signal px-3.5 py-2.5 font-bold text-on-signal underline focus:top-3"
        href="#about"
      >
        Skip to content
      </a>

      <header
        className="sticky top-0 z-20 border-b border-line bg-paper/80 backdrop-saturate-[140%] backdrop-blur-[10px] max-nav:data-[open]:bg-paper print:hidden"
        data-open={menu ? 'true' : undefined}
      >
        <div className="wrap flex h-[60px] items-center gap-6 max-tight:px-5">
          <a className="inline-flex items-center gap-2.5 text-lg font-extrabold font-stretch-[125%] tracking-[-0.01em] no-underline" href="#top" onClick={(e) => { e.preventDefault(); go('top') }}>
            <span
              className="relative size-5 rounded-[3px] bg-[#26262b] shadow-[inset_0_0_0_1px_var(--color-line-strong)] after:absolute after:-top-px after:left-1/2 after:h-[5px] after:w-2 after:-translate-x-1/2 after:rounded-b-[6px] after:bg-signal after:content-['']"
              aria-hidden="true"
            />
            <span className="text-lg font-extrabold font-stretch-[125%] tracking-[-0.01em]">
              tr1x<span className="font-medium text-ink-3">/dev</span>
            </span>
          </a>
          <nav className="mono ml-auto flex gap-1 text-[13px] max-nav:hidden" aria-label="Sections">
            {navLinks}
          </nav>
          <button type="button" className="mono h-9 min-w-11 cursor-pointer rounded-md border border-line bg-transparent px-2.5 text-[13px] hover:border-ink max-nav:ml-auto touch:hidden [&>kbd]:border-0 [&>kbd]:p-0 [&>kbd]:text-[13px]" onClick={() => setPalette(true)} aria-label="Open command palette">
            <kbd>{kbd}</kbd>
          </button>
          <button
            type="button"
            className="group mono ml-auto hidden h-10 cursor-pointer items-center gap-2 rounded-md border border-line bg-transparent px-3 text-[13px] text-ink max-nav:inline-flex"
            aria-expanded={menu}
            aria-controls="mobile-nav"
            data-open={menu ? 'true' : undefined}
            onClick={() => setMenu((m) => !m)}
          >
            <span
              className="relative block h-[1.5px] w-3.5 -translate-y-[3px] bg-current transition-transform duration-200 before:absolute before:top-1.5 before:block before:h-[1.5px] before:w-3.5 before:bg-current before:transition-transform before:duration-200 before:content-[''] group-data-[open]:rotate-45 group-data-[open]:before:top-0 group-data-[open]:before:-rotate-90"
              aria-hidden="true"
            />
            {menu ? 'close' : 'menu'}
          </button>
        </div>
        <nav
          id="mobile-nav"
          className={`${menu ? 'grid' : 'hidden'} mono border-t border-line px-10 pt-2 pb-5 text-[15px] max-tight:px-5 nav:hidden`}
          aria-label="Sections"
        >
          {mobileLinks}
          <a className="py-3.5 text-ink no-underline" href={profile.links.github} target="_blank" rel="noreferrer">
            github.com/{profile.githubUser} ↗
          </a>
        </nav>
      </header>

      <main>
        <section className="relative border-b border-line pt-[clamp(40px,8vw,96px)] pb-[clamp(32px,5vw,56px)]" id="top" aria-label="Intro">
          <div className="wrap max-tight:px-5">
            <p className="mono m-0 mb-[clamp(16px,3vw,28px)] flex flex-wrap items-center gap-2.5 text-xs tracking-[0.08em] text-ink-2 uppercase">
              <span className="led" aria-hidden="true" /> {profile.partNo} <span className="text-ink-3">/</span> {profile.revision}{' '}
              <span className="text-ink-3">/</span> {profile.location}, {profile.tzLabel}
            </p>
            <h1 className="m-0 mb-0 ml-[-0.04em] flex flex-wrap text-hero leading-[0.82] font-extrabold font-stretch-[125%] tracking-[-0.055em]" aria-label={profile.handle}>
              <span>tr1x</span>
              <span className="text-signal">dev</span>
            </h1>
            <svg className="mt-[clamp(20px,3vw,32px)] block h-7 w-full fill-none stroke-line-strong [stroke-width:1.5] [vector-effect:non-scaling-stroke]" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
              <path className="[stroke-width:1.5] [vector-effect:non-scaling-stroke]" d="M0 20H420l14-16 18 32 18-32 18 32 14-16H760l10-10 10 10H1200" />
            </svg>
            <div className="mt-[clamp(20px,3vw,32px)] grid grid-cols-[minmax(0,1.4fr)_auto] items-end gap-10 max-tight:grid-cols-[1fr] max-tight:gap-6">
              <p className="m-0 max-w-[620px] text-lede leading-[1.55] text-ink-2 [text-wrap:pretty]">
                <strong className="font-bold text-ink">Backend &amp; systems developer.</strong> I build services that talk over the network, data that has to stay
                correct, and tools that make the rest of the stack faster. Go and Rust at the core, gRPC and Kafka on the wire,
                PostgreSQL underneath.
              </p>
              <div className="flex flex-wrap gap-3 print:hidden">
                <button type="button" className={`${btnInk} max-phone:basis-0 max-phone:flex-1 max-phone:justify-center`} onClick={() => go('work')}>
                  See the work <span aria-hidden="true">↓</span>
                </button>
                <a className={`${btnLine} max-phone:basis-0 max-phone:flex-1 max-phone:justify-center`} href={profile.links.github} target="_blank" rel="noreferrer">
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <dl className="relative m-0 mt-[clamp(36px,5vw,64px)] grid grid-cols-4 border-t-2 border-b border-t-rule border-b-line max-tight:mt-12 max-tight:grid-cols-2">
              <div className={specCell}>
                <dt className={specLabel}>core</dt>
                <dd className={specValue}>Go · Rust</dd>
              </div>
              <div className={specCellDivided}>
                <dt className={specLabel}>wire</dt>
                <dd className={specValue}>gRPC · Kafka</dd>
              </div>
              <div className={`${specCellDivided} max-tight:border-l-0 max-tight:border-t max-tight:border-line max-tight:pl-0`}>
                <dt className={specLabel}>storage</dt>
                <dd className={specValue}>Postgres · Redis</dd>
              </div>
              <div className={`${specCellDivided} max-tight:border-t max-tight:border-line`}>
                <dt className={specLabel}>status</dt>
                <dd className={specValue}>
                  <span className="led shrink-0" aria-hidden="true" /> Open to projects
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="about" className={sectionBase}>
          <div className="wrap max-tight:px-5">
            <SectionHead no="01" title="General description" />
            <div className="grid grid-cols-[1.4fr_1fr] gap-16 pl-[88px] max-nav:pl-0 max-tight:grid-cols-[1fr] max-tight:gap-10">
              <p className="m-0 max-w-[640px] text-overview leading-[1.3] font-medium tracking-[-0.012em]">
                I’m a backend developer who likes the parts of a system nobody sees:{' '}
                <em className="bg-[linear-gradient(transparent_64%,rgba(255,90,31,0.42)_64%)] text-ink not-italic">protocols, queues, storage</em> and the failure
                modes between them. Most of my time goes into services in Go and Rust; the rest goes into low-level side projects and ML
                experiments.
              </p>
              <div>
                <h3 className="mono m-0 mb-3 text-xs font-medium tracking-[0.12em] text-ink-3 uppercase">Features</h3>
                <ul className="m-0 list-none p-0">
                  <li className="relative border-b border-line py-2.5 pl-[22px] before:absolute before:top-[19px] before:left-0 before:size-2 before:bg-ink-3 before:content-[''] last:before:bg-signal">Backend services &amp; system architecture</li>
                  <li className="relative border-b border-line py-2.5 pl-[22px] before:absolute before:top-[19px] before:left-0 before:size-2 before:bg-ink-3 before:content-[''] last:before:bg-signal">Message-driven pipelines on Kafka, gRPC and Protobuf</li>
                  <li className="relative border-b border-line py-2.5 pl-[22px] before:absolute before:top-[19px] before:left-0 before:size-2 before:bg-ink-3 before:content-[''] last:before:bg-signal">Low-level code in Rust, C and C++</li>
                  <li className="relative border-b border-line py-2.5 pl-[22px] before:absolute before:top-[19px] before:left-0 before:size-2 before:bg-ink-3 before:content-[''] last:before:bg-signal">Machine learning, mostly hands-on experiments</li>
                  <li className="relative border-b border-line py-2.5 pl-[22px] before:absolute before:top-[19px] before:left-0 before:size-2 before:bg-ink-3 before:content-[''] last:before:bg-signal">Tests, profiling and observability from day one</li>
                  <li className="relative border-b border-line py-2.5 pl-[22px] before:absolute before:top-[19px] before:left-0 before:size-2 before:bg-ink-3 before:content-[''] last:before:bg-signal">Side projects shipped end-to-end</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className={sectionBase}>
          <div className="wrap max-tight:px-5">
            <SectionHead no="02" title="Application examples" aside="selected work · live from github" />
            <Work />
          </div>
        </section>

        <section id="stack" className={sectionBase}>
          <div className="wrap max-tight:px-5">
            <SectionHead no="03" title="Pin configuration" aside="22-pin DIP · top view" />
            <Pinout />
          </div>
        </section>

        <section id="process" className={`${sectionBase} border-y border-line bg-paper-2`}>
          <div className="wrap max-tight:px-5">
            <SectionHead no="04" title="Operating principles" aside="spec → ship" />
            <Process />
          </div>
        </section>

        <section id="specs" className={sectionBase}>
          <div className="wrap max-tight:px-5">
            <SectionHead no="05" title="Electrical characteristics" aside="measured live" />
            <Stats />
          </div>
        </section>

        <section id="contact" className={sectionContact}>
          <div className="wrap max-tight:px-5">
            <SectionHead no="06" title="Ordering information" />
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-end gap-16 max-tight:grid-cols-[1fr] max-tight:gap-10">
              <table className="w-full border-collapse [&_td]:border-b [&_td]:border-line [&_td]:py-3 [&_td]:text-left [&_td]:font-bold [&_th]:w-[40%] [&_th]:border-b [&_th]:border-line [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:tracking-[0.1em] [&_th]:text-ink-3 [&_th]:uppercase">
                <tbody>
                  <tr>
                    <th scope="row" className="mono">part number</th>
                    <td>{profile.partNo}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="mono">handle</th>
                    <td>{profile.handle}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="mono">time zone</th>
                    <td>{profile.tzLabel}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="mono">interface</th>
                    <td>GitHub{profile.links.email ? ' · Email' : ''}{profile.links.telegram ? ' · Telegram' : ''}</td>
                  </tr>
                </tbody>
              </table>
              <div>
                <p className="mono m-0 mb-3 text-sm text-ink-2">Open to backend work, collaborations and odd side projects.</p>
                <a className="group inline-flex flex-wrap items-baseline text-mega leading-[0.95] font-extrabold font-stretch-[118%] tracking-[-0.04em] no-underline [overflow-wrap:anywhere]" href={profile.links.github} target="_blank" rel="noreferrer">
                  <span className="font-medium text-ink-3">github.com/</span>
                  {profile.githubUser}
                  <span className="ml-[0.12em] text-signal [transition:transform_0.25s] group-hover:translate-x-[0.08em] group-hover:-translate-y-[0.08em]" aria-hidden="true">↗</span>
                </a>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className={btnLine} onClick={() => copy(profile.links.github, 'GitHub URL')}>
                    Copy link
                  </button>
                  {profile.links.email && (
                    <a className={btnLine} href={`mailto:${profile.links.email}`}>
                      Email
                    </a>
                  )}
                  {profile.links.telegram && (
                    <a className={btnLine} href={profile.links.telegram} target="_blank" rel="noreferrer">
                      Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
            <p className="mono m-0 mt-24 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-xs text-ink-3">
              <span>© {new Date().getFullYear()} {profile.handle}</span>
              <span>react + typescript + vite</span>
              <span>hosted on github pages</span>
              <span className="touch:hidden">
                press <kbd>{kbd}</kbd>
              </span>
            </p>
          </div>
        </section>
      </main>

      <StatusBar section={current ? `${current.no} ${current.label.toLowerCase()}` : '00 top'} onPalette={() => setPalette(true)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
      <div className="mono fixed bottom-[calc(var(--spacing-bar)+16px+env(safe-area-inset-bottom))] left-1/2 z-[60] -translate-x-1/2 translate-y-3 rounded-lg bg-signal px-4 py-2.5 text-[13px] font-bold text-on-signal opacity-0 pointer-events-none [transition:opacity_0.2s,transform_0.2s] data-[on=true]:translate-y-0 data-[on=true]:opacity-100" role="status" aria-live="polite" data-on={toast ? 'true' : undefined}>
        {toast}
      </div>
    </>
  )
}
