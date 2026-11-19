# tr1xdev — TRX-01 datasheet

Portfolio styled as an engineering IC datasheet. React 19 + TypeScript + Vite.

## Run

```bash
npm install
npm run dev
```

## Deploy to Vercel (Free / Hobby)

1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo.
3. Framework preset: **Vite** (build `npm run build`, output `dist`). Deploy.

Or from the terminal: `npx vercel` → `npx vercel --prod`.

## Edit

All content lives in `src/data/profile.ts`: links (email / telegram are hidden while empty), pins (skills), sections.
Projects (§04) and Electrical characteristics (§05) share one request to the public GitHub API, cached per session.
No third-party image services are needed; if the API is rate-limited, both sections degrade gracefully.

## Keys

- `⌘K` / `Ctrl K` or `/` — command palette
- `F` — flip the business card
