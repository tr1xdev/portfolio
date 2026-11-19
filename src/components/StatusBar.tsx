import { useEffect, useState } from 'react'
import { isMac } from '../hooks'
import { profile } from '../data/profile'

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: profile.timezone,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const item = 'flex items-center gap-2 border-r border-line px-4 whitespace-nowrap max-phone:px-3'

export function StatusBar({ section, onPalette }: { section: string; onPalette: () => void }) {
  const [now, setNow] = useState(() => new Date())
  const [start] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const up = Math.floor((now.getTime() - start) / 1000)
  const uptime = `${pad(Math.floor(up / 3600))}:${pad(Math.floor((up % 3600) / 60))}:${pad(up % 60)}`

  return (
    <footer className="mono fixed inset-x-0 bottom-0 z-30 flex h-[calc(var(--spacing-bar)+env(safe-area-inset-bottom))] items-stretch border-t border-line bg-[rgba(8,8,9,0.92)] pb-[env(safe-area-inset-bottom)] text-xs text-ink-2 backdrop-blur-[10px] print:hidden" aria-label="Status bar">
      <span className={`${item} text-ink`}>
        <span className="led" aria-hidden="true" /> online
      </span>
      <span className={item}>
        <span className="text-ink-3">tr1x local</span> {fmt.format(now)} {profile.tzLabel.split(' ')[0]}
      </span>
      <span className={`${item} max-tight:hidden`}>
        <span className="text-ink-3">session</span> {uptime}
      </span>
      <span className={`${item} max-tight:hidden`}>
        <span className="text-ink-3">§</span> {section}
      </span>
      <button type="button" className="mono ml-auto flex cursor-pointer items-center gap-2 border-l border-line bg-transparent px-4 text-xs whitespace-nowrap text-ink hover:bg-signal hover:text-on-signal max-phone:px-3 max-phone:text-[11px] touch:hidden [&>kbd]:text-[11px]" onClick={onPalette}>
        <kbd>{isMac ? '⌘' : 'Ctrl'} K</kbd> commands
      </button>
    </footer>
  )
}
