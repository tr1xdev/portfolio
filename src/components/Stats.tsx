import { profile } from '../data/profile'
import { ago, useRepos } from '../github'
import type { Repo } from '../github'

const MIX_COLORS = ['var(--signal)', 'var(--g-arch)', 'var(--g-data)', 'var(--g-infra)', '#d8b45a']
const ACTIVE_DAYS = 90

function languageMix(repos: Repo[]) {
  const counts = new Map<string, number>()
  for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1)
  const total = [...counts.values()].reduce((a, b) => a + b, 0)
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, 5)
  const rest = sorted.slice(5).reduce((a, [, n]) => a + n, 0)
  const rows = top.map(([name, n], i) => ({ name, n, color: MIX_COLORS[i] }))
  if (rest > 0) rows.push({ name: 'Other', n: rest, color: 'var(--ink-3)' })
  return { total, rows, distinct: counts.size }
}

export function Stats() {
  const state = useRepos()
  const repos = state.status === 'ok' ? state.repos : []
  const ready = state.status === 'ok'
  const mix = languageMix(repos)
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0)
  const active = repos.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < ACTIVE_DAYS * 86_400_000).length
  const v = (x: string | number) => (ready ? String(x) : state.status === 'loading' ? '…' : '—')

  const rows: { param: string; sym: string; sub?: string; value: string; unit: string }[] = [
    { param: 'Public repositories', sym: 'N', sub: 'repo', value: v(repos.length), unit: '' },
    { param: `Active in the last ${ACTIVE_DAYS} days`, sym: 'N', sub: 'act', value: v(active), unit: 'repo' },
    { param: 'Languages in use', sym: 'N', sub: 'lang', value: v(mix.distinct), unit: '' },
    { param: 'Primary language', sym: 'L', sub: '0', value: v(mix.rows[0]?.name ?? '—'), unit: '' },
    { param: 'Stars received', sym: 'Σ★', value: v(stars), unit: '' },
    { param: 'Last push', sym: 't', sub: 'push', value: v(repos[0] ? ago(repos[0].pushed_at) : '—'), unit: '' },
  ]

  return (
    <div className="stats">
      <div className="stats-table-wrap">
        <table className="stats-table" aria-busy={state.status === 'loading'}>
          <thead className="mono">
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col">Symbol</th>
              <th scope="col" className="num">
                Value
              </th>
              <th scope="col">Unit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.param}>
                <th scope="row">{r.param}</th>
                <td className="mono sym">
                  {r.sym}
                  {r.sub && <sub>{r.sub}</sub>}
                </td>
                <td className="mono num">{r.value}</td>
                <td className="mono unit">{r.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="stats-note mono">
          {state.status === 'error'
            ? 'GitHub API is not answering right now (rate limit or offline). Values will appear on the next visit.'
            : `Test conditions: public, non-fork repositories of @${profile.githubUser}, read live from the GitHub API.`}
        </p>
      </div>

      <figure className="mix">
        <figcaption className="mix-bar-head mono">
          <span>Language mix</span>
          <span>by repository</span>
        </figcaption>
        <div className="mix-body">
          <div
            className={`mix-bar${ready && mix.total ? '' : ' is-empty'}`}
            role="img"
            aria-label={
              ready && mix.total
                ? 'Language mix: ' + mix.rows.map((r) => `${r.name} ${Math.round((r.n / mix.total) * 100)}%`).join(', ')
                : 'Language mix unavailable'
            }
          >
            {ready &&
              mix.rows.map((r) => (
                <span key={r.name} style={{ flexGrow: r.n, background: r.color }} />
              ))}
          </div>
          <ul className="mix-legend">
            {ready && mix.total > 0 ? (
              mix.rows.map((r) => (
                <li key={r.name}>
                  <span className="swatch" style={{ background: r.color }} aria-hidden="true" />
                  <span>{r.name}</span>
                  <span className="mono">{Math.round((r.n / mix.total) * 100)}%</span>
                </li>
              ))
            ) : (
              <li className="mix-empty mono">{state.status === 'loading' ? 'measuring…' : 'no signal'}</li>
            )}
          </ul>
        </div>
      </figure>
    </div>
  )
}
