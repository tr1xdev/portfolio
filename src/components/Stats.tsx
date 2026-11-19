import { profile } from '../data/profile'
import { ago, mix, pct, useLanguages, useRepos } from '../github'

const ACTIVE_DAYS = 90

const head = 'border-b border-line-strong pb-2.5 text-left text-[11px] font-medium tracking-[0.12em] text-ink-3 uppercase'
const cell = 'border-b border-line py-[14px] text-left align-baseline'

export function Stats() {
  const state = useRepos()
  const langs = useLanguages()
  const repos = state.status === 'ok' ? state.repos : []
  const ready = state.status === 'ok'
  const rows = langs.status === 'ok' ? mix(langs.total) : []
  const distinct = langs.status === 'ok' ? Object.keys(langs.total).length : 0
  const bytes = langs.status === 'ok' && langs.basis === 'bytes' ? Object.values(langs.total).reduce((a, b) => a + b, 0) : 0
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0)
  const active = repos.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < ACTIVE_DAYS * 86_400_000).length
  const v = (x: string | number, ok = ready) => (ok ? String(x) : state.status === 'error' ? '—' : '…')
  const langReady = langs.status === 'ok'

  const table: { param: string; sym: string; sub?: string; value: string; unit: string }[] = [
    { param: 'Public repositories', sym: 'N', sub: 'repo', value: v(repos.length), unit: '' },
    { param: `Active in the last ${ACTIVE_DAYS} days`, sym: 'N', sub: 'act', value: v(active), unit: 'repo' },
    { param: 'Languages in use', sym: 'N', sub: 'lang', value: v(distinct, langReady), unit: '' },
    { param: 'Largest language', sym: 'L', sub: '0', value: v(rows[0] ? `${rows[0].name} ${pct(rows[0].share)}` : '—', langReady), unit: '' },
    { param: 'Code measured', sym: 'B', value: v(bytes ? (bytes / 1024).toFixed(0) : '—', langReady), unit: bytes ? 'KiB' : '' },
    { param: 'Stars received', sym: 'Σ★', value: v(stars), unit: '' },
    { param: 'Last push', sym: 't', sub: 'push', value: v(repos[0] ? ago(repos[0].pushed_at) : '—'), unit: '' },
  ]

  const basis = langs.status === 'ok' && langs.basis === 'repos' ? 'by repository (API limit)' : 'by bytes of code'

  return (
    <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start gap-12 max-tight:grid-cols-[1fr] max-tight:gap-10">
      <div>
        <table className="w-full border-collapse text-[15px]" aria-busy={state.status === 'loading'}>
          <thead className="mono">
            <tr>
              <th scope="col" className={`${head} pr-3`}>Parameter</th>
              <th scope="col" className={`${head} pr-3 max-tight:hidden`}>Symbol</th>
              <th scope="col" className={`${head} pr-5 text-right`}>Value</th>
              <th scope="col" className={`${head} pr-3 max-tight:hidden`}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r) => (
              <tr key={r.param}>
                <th scope="row" className={`${cell} pr-3 font-medium`}>{r.param}</th>
                <td className={`mono ${cell} pr-3 italic text-ink-2 max-tight:hidden`}>
                  {r.sym}
                  {r.sub && <sub className="static bottom-auto ml-px align-sub text-[0.72em] not-italic leading-[1.5]">{r.sub}</sub>}
                </td>
                <td className={`mono ${cell} pr-5 text-right text-[17px] font-bold text-ink tabular-nums`}>{r.value}</td>
                <td className={`mono ${cell} w-14 pr-3 text-[13px] text-ink-3 max-tight:hidden`}>{r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mono mt-3.5 mb-0 text-xs text-ink-3">
          {state.status === 'error'
            ? 'GitHub API is not answering right now (rate limit or offline). Values will appear on the next visit.'
            : `Test conditions: public, non-fork repositories of @${profile.githubUser}, this site excluded. Languages are measured by GitHub linguist in bytes, so markup and styles count too. Private work is not included.`}
        </p>
      </div>

      <figure className="mix-grid m-0 overflow-hidden rounded-xl border border-line-2">
        <figcaption className="mono flex justify-between border-b border-line px-4 py-3 text-xs text-ink-3">
          <span>Language mix</span>
          <span>{basis}</span>
        </figcaption>
        <div className="px-5 pt-6 pb-5">
          <div
            className={`flex h-3.5 gap-[3px] ${rows.length ? '' : 'rounded-[2px] bg-[repeating-linear-gradient(90deg,var(--color-line-2)_0_6px,transparent_6px_9px)]'}`}
            role="img"
            aria-label={rows.length ? 'Language mix: ' + rows.map((r) => `${r.name} ${pct(r.share)}`).join(', ') : 'Language mix unavailable'}
          >
            {rows.map((r) => (
              <span key={r.name} className="min-w-1.5 rounded-[2px]" style={{ flexGrow: r.value, background: r.color }} />
            ))}
          </div>
          <ul className="m-0 mt-5 grid list-none gap-0.5 p-0">
            {rows.length > 0 ? (
              rows.map((r) => (
                <li key={r.name} className="grid grid-cols-[10px_1fr_auto] items-center gap-3 border-b border-line py-2 text-[15px] last:border-b-0">
                  <span className="swatch" style={{ background: r.color }} aria-hidden="true" />
                  <span>{r.name}</span>
                  <span className="mono text-[13px] text-ink-2 tabular-nums">{pct(r.share)}</span>
                </li>
              ))
            ) : (
              <li className="mono block border-b border-line py-2 text-ink-3 last:border-b-0">
                {langs.status === 'error' || state.status === 'error' ? 'no signal' : 'measuring…'}
              </li>
            )}
          </ul>
        </div>
      </figure>
    </div>
  )
}
