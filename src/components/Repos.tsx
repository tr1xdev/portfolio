import { profile } from '../data/profile'
import { ago, useRepos } from '../github'

const LIMIT = 6

export function Repos() {
  const state = useRepos()

  return (
    <div className="repos">
      <div className="repos-head mono" aria-hidden="true">
        <span>#</span>
        <span>Repository</span>
        <span>Language</span>
        <span>★</span>
        <span>Last push</span>
      </div>

      {state.status === 'loading' && (
        <ul className="repo-list" aria-busy="true" aria-label="Loading repositories">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="repo is-skeleton">
              <span className="sk" />
            </li>
          ))}
        </ul>
      )}

      {state.status === 'error' && (
        <div className="repo-error">
          <p className="mono">ERR · bus timeout. GitHub API didn’t answer (rate limit or offline).</p>
          <a className="btn btn-ink" href={profile.links.github} target="_blank" rel="noreferrer">
            Browse repositories on GitHub ↗
          </a>
        </div>
      )}

      {state.status === 'ok' && state.repos.length === 0 && (
        <div className="repo-error">
          <p className="mono">No public repositories yet. New silicon is still in the fab.</p>
        </div>
      )}

      {state.status === 'ok' && state.repos.length > 0 && (
        <ul className="repo-list">
          {state.repos.slice(0, LIMIT).map((r, i) => (
            <li key={r.name} className="repo">
              <a href={r.html_url} target="_blank" rel="noreferrer">
                <span className="repo-i mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="repo-main">
                  <span className="repo-name">
                    {r.name} <span className="arrow" aria-hidden="true">↗</span>
                  </span>
                  {r.description && <span className="repo-desc">{r.description}</span>}
                </span>
                <span className="repo-lang mono">{r.language ?? '—'}</span>
                <span className="repo-stars mono" aria-label={`${r.stargazers_count} stars`}>
                  {r.stargazers_count}
                </span>
                <span className="repo-time mono">{ago(r.pushed_at)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {state.status === 'ok' && state.repos.length > LIMIT && (
        <a className="repos-more mono" href={profile.links.github + '?tab=repositories'} target="_blank" rel="noreferrer">
          + {state.repos.length - LIMIT} more on GitHub ↗
        </a>
      )}
    </div>
  )
}
