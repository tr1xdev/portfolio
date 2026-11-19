// ─────────────────────────────────────────────────────────────
//  Edit this file to update everything on the site.
// ─────────────────────────────────────────────────────────────

export const profile = {
  handle: 'tr1xdev',
  partNo: 'TRX-01',
  revision: 'REV 26.11',
  role: 'Software & backend developer',
  summary: 'Backend developer. Systems work, ML experiments, side projects.',
  githubUser: 'tr1xdev',
  timezone: 'Europe/Moscow',
  tzLabel: 'MSK · UTC+3',
  links: {
    github: 'https://github.com/tr1xdev',
    // Optional — leave empty to hide. e.g. 'hello@example.com'
    email: '',
    // Optional — leave empty to hide. e.g. 'https://t.me/yourname'
    telegram: '',
  },
}

export type GroupId = 'lang' | 'arch' | 'data' | 'infra'

export const groups: Record<GroupId, { label: string; short: string }> = {
  lang: { label: 'Languages', short: 'LANG' },
  arch: { label: 'Backend & architecture', short: 'ARCH' },
  data: { label: 'Databases & storage', short: 'DATA' },
  infra: { label: 'Tools & infrastructure', short: 'INFRA' },
}

export type Pin = { signal: string; name: string; group: GroupId; note: string }

// Pins 1–11 run down the left side, 12–22 run up the right side (DIP convention).
export const pins: Pin[] = [
  { signal: 'GO', name: 'Go', group: 'lang', note: 'Services, CLIs and concurrent pipelines.' },
  { signal: 'RUST', name: 'Rust', group: 'lang', note: 'Fast, memory-safe systems code.' },
  { signal: 'TS', name: 'TypeScript', group: 'lang', note: 'Typed tooling and frontends.' },
  { signal: 'JS', name: 'JavaScript', group: 'lang', note: 'The web runtime, everywhere.' },
  { signal: 'C', name: 'C', group: 'lang', note: 'Close to the metal.' },
  { signal: 'CPP', name: 'C++', group: 'lang', note: 'Performance-critical components.' },
  { signal: 'GRPC', name: 'gRPC', group: 'arch', note: 'Service-to-service RPC.' },
  { signal: 'PROTO', name: 'Protobuf', group: 'arch', note: 'Schema-first contracts.' },
  { signal: 'REST', name: 'REST APIs', group: 'arch', note: 'Public-facing HTTP interfaces.' },
  { signal: 'KAFKA', name: 'Kafka', group: 'arch', note: 'Event streams and async pipelines.' },
  { signal: 'GQL', name: 'GraphQL', group: 'arch', note: 'Typed query layer for clients.' },
  { signal: 'PG', name: 'PostgreSQL', group: 'data', note: 'The default source of truth.' },
  { signal: 'REDIS', name: 'Redis', group: 'data', note: 'Caching, queues, rate limits.' },
  { signal: 'SQLITE', name: 'SQLite', group: 'data', note: 'Embedded storage for small, sharp tools.' },
  { signal: 'SQLC', name: 'sqlc', group: 'data', note: 'Type-safe Go from plain SQL.' },
  { signal: 'DOCKER', name: 'Docker', group: 'infra', note: 'Reproducible environments.' },
  { signal: 'GIT', name: 'Git', group: 'infra', note: 'History you can trust.' },
  { signal: 'LINUX', name: 'Linux', group: 'infra', note: 'Home turf.' },
  { signal: 'CMAKE', name: 'CMake', group: 'infra', note: 'C/C++ builds.' },
  { signal: 'MAKE', name: 'Makefile', group: 'infra', note: 'One-word workflows.' },
  { signal: 'VITE', name: 'Vite', group: 'infra', note: 'Instant frontend tooling.' },
  { signal: 'REACT', name: 'React', group: 'infra', note: 'Interfaces like this one.' },
]

export const sections = [
  { id: 'overview', no: '01', label: 'Overview' },
  { id: 'pinout', no: '02', label: 'Pinout' },
  { id: 'process', no: '03', label: 'Process' },
  { id: 'projects', no: '04', label: 'Projects' },
  { id: 'specs', no: '05', label: 'Specs' },
  { id: 'contact', no: '06', label: 'Contact' },
] as const

export const skillIconsUrl =
  'https://skillicons.dev/icons?i=js,ts,go,rust,c,cpp,react,kafka,graphql,redis,postgres,cmake,docker,git&theme=dark'

