import { featured, profile } from '../data/profile'
import { ago, mix, pct, useLanguages, useRepos } from '../github'
import type { Repo } from '../github'

const MORE_LIMIT = 6

const bar = 'flex h-1.5 gap-0.5 overflow-hidden rounded-[2px]'
const barSpan = 'min-w-[3px] basis-0'
const metaText = 'text-[13px] text-ink-2'

function LangBar({ name }: { name: string }) {
  const langs = useLanguages()
  const bytes = langs.status === 'ok' ? langs.byRepo[name] : undefined
  const rows = bytes ? mix(bytes, 3) : []
  if (!rows.length) return <div className={`${bar} mt-auto bg-paper-3`} aria-hidden="true" />
  return (
    <div className="mt-auto grid gap-2">
      <div className={bar} role="img" aria-label={rows.map((r) => `${r.name} ${pct(r.share)}`).join(', ')}>
        {rows.map((r) => (
          <span key={r.name} className={barSpan} style={{ flexGrow: r.value, background: r.color }} />
        ))}
      </div>
      <ul className="mono m-0 flex list-none flex-wrap gap-x-3.5 gap-y-1 p-0 text-xs text-ink-3" aria-hidden="true">
        {rows.map((r) => (
          <li key={r.name} className="inline-flex items-center gap-1.5">
            <i className="size-2 rounded-[2px]" style={{ background: r.color }} />
            {r.name} {pct(r.share)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Work() {
  const state = useRepos()
  const repos = state.status === 'ok' ? state.repos : []
  const byName = new Map<string, Repo>(repos.map((r) => [r.name.toLowerCase(), r]))
  const picked = new Set(featured.map((f) => f.repo.toLowerCase()))
  const more = repos.filter((r) => !picked.has(r.name.toLowerCase()))

  return (
    <div>
      <ol className="m-0 grid list-none grid-cols-2 gap-px border border-line bg-line p-0 max-tight:grid-cols-[1fr]">
        {featured.map((f, i) => {
          const r = byName.get(f.repo.toLowerCase())
          const href = r?.html_url ?? `${profile.links.github}/${f.repo}`
          return (
            <li key={f.repo} className={`bg-paper ${i === 0 ? 'col-span-full' : ''}`}>
              <a
                className="group flex h-full flex-col gap-3.5 p-[clamp(20px,3vw,32px)] no-underline [transition:background_0.2s] hover:bg-paper-2 focus-visible:outline-offset-[-2px]"
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="mono flex items-center gap-3 text-[11px] tracking-[0.12em] text-ink-3 uppercase">
                  <span className="text-signal-ink">{String(i + 1).padStart(2, '0')}</span>
                  <span>{f.kind}</span>
                  {r?.archived && <span className="ml-auto rounded-[3px] border border-line-strong px-1.5 py-0.5">archived</span>}
                </span>
                <span className={`flex items-baseline gap-2.5 leading-none font-extrabold font-stretch-[118%] tracking-[-0.03em] text-ink ${i === 0 ? 'text-card-lead' : 'text-card'}`}>
                  {f.title}
                  <span className="text-[0.5em] text-ink-3 [transition:transform_0.2s,color_0.2s] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal" aria-hidden="true">↗</span>
                </span>
                <span className="max-w-[620px] text-base leading-[1.55] text-ink-2">{f.summary}</span>
                <span className="mono flex flex-wrap gap-1.5 text-xs">
                  {f.stack.map((s) => (
                    <span key={s} className="rounded-[4px] border border-line-2 px-2 py-[3px] text-ink-2">{s}</span>
                  ))}
                </span>
                <LangBar name={r?.name ?? f.repo} />
                <span className="mono flex justify-between gap-3 border-t border-dashed border-line-2 pt-3.5 text-xs text-ink-3 [overflow-wrap:anywhere] max-phone:flex-col max-phone:gap-1">
                  <span>github.com/{profile.githubUser}/{f.repo}</span>
                  <span>
                    {r ? (
                      <>
                        ★ {r.stargazers_count} · {ago(r.pushed_at)}
                      </>
                    ) : state.status === 'loading' ? (
                      '…'
                    ) : (
                      ''
                    )}
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ol>

      {state.status === 'ok' && more.length > 0 && (
        <div className="mt-12">
          <h3 className="mono m-0 mb-3 text-xs font-medium tracking-[0.12em] text-ink-3 uppercase">More repositories</h3>
          <ul className="m-0 list-none p-0">
            {more.slice(0, MORE_LIMIT).map((r, i) => (
              <li key={r.name} className="border-b border-line">
                <a
                  className="group grid grid-cols-[56px_minmax(0,1fr)_130px_56px_110px] items-baseline gap-4 py-5 no-underline [transition:background_0.15s,padding_0.2s] hover:bg-paper-2 hover:px-3 max-tight:grid-cols-[1fr_auto] max-tight:gap-x-4 max-tight:gap-y-2 max-tight:[grid-template-areas:'main_main'_'lang_time']"
                  href={r.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="mono text-[13px] text-ink-3 max-tight:hidden">{String(featured.length + i + 1).padStart(2, '0')}</span>
                  <span className="grid gap-1 max-tight:[grid-area:main]">
                    <span className="text-[22px] font-bold font-stretch-[112%] tracking-[-0.015em]">
                      {r.name}{' '}
                      <span className="inline-block text-signal-ink transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]" aria-hidden="true">↗</span>
                    </span>
                    {r.description && <span className="text-ink-2">{r.description}</span>}
                  </span>
                  <span className={`mono ${metaText} max-tight:[grid-area:lang]`}>{r.language ?? '—'}</span>
                  <span className={`mono ${metaText} max-tight:hidden`}>★ {r.stargazers_count}</span>
                  <span className={`mono ${metaText} max-tight:[grid-area:time]`}>{ago(r.pushed_at)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.status === 'error' && (
        <p className="mono mt-5 mb-0 text-[13px] text-ink-3">GitHub API is not answering (rate limit or offline). Live stats will appear on the next visit.</p>
      )}

      <a className="mono mt-3 inline-flex min-h-11 items-center text-[13px] text-ink-2 no-underline hover:text-signal-ink" href={profile.links.github + '?tab=repositories'} target="_blank" rel="noreferrer">
        All repositories on GitHub ↗
      </a>
    </div>
  )
}
