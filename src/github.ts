import { useEffect, useState } from 'react'
import { profile } from './data/profile'

export type Repo = {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
}

export type ReposState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; repos: Repo[] }

const CACHE_KEY = 'gh-repos:v2:' + profile.githubUser
const API = 'https://api.github.com/users/' + profile.githubUser + '/repos?sort=pushed&per_page=100'

// One request per page load, shared by every section that needs repo data.
let inflight: Promise<Repo[]> | null = null

function readCache(): Repo[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Repo[]) : null
  } catch {
    return null
  }
}

function load(): Promise<Repo[]> {
  if (!inflight) {
    inflight = fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status))
        return r.json() as Promise<Repo[]>
      })
      .then((all) => {
        const repos = all
          .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== profile.githubUser.toLowerCase())
          .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at))
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(repos))
        } catch {
          /* storage full or disabled: fine, just skip caching */
        }
        return repos
      })
      .catch((err: unknown) => {
        inflight = null
        throw err
      })
  }
  return inflight
}

export function useRepos(): ReposState {
  const [state, setState] = useState<ReposState>(() => {
    const cached = readCache()
    return cached ? { status: 'ok', repos: cached } : { status: 'loading' }
  })

  useEffect(() => {
    if (state.status === 'ok') return
    let alive = true
    load()
      .then((repos) => alive && setState({ status: 'ok', repos }))
      .catch(() => alive && setState({ status: 'error' }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

export function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
