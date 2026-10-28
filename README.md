# Radha × Krishna — Our Eternal Love Story

## Folder structure
```
radha-krishna-anniversary/
├── index.html                      app shell + fonts
├── package.json / vite.config.ts / tsconfig.json
├── .env.example                    copy to .env
├── src/
│   ├── index.tsx                   entry
│   ├── App.tsx                     stage machine: countdown → loading → passcode → welcome → main → final
│   ├── screens.tsx                 Countdown, Loading, Passcode, Welcome, Final
│   ├── Main.tsx                    nav + Story, Timeline, Gallery, Letters, Quotes, Journey, Cake
│   ├── Admin.tsx                   owner panel (#/admin)
│   ├── art.tsx                     feather, flute, sparkles (SVG/CSS, original art)
│   ├── lib.ts                      Supabase client, server-synced clock, IST calendar math, chime
│   └── styles.css                  palette + responsive styles
└── supabase/
    ├── migrations/001_schema.sql   tables, RLS, storage buckets, starter content
    ├── config.toml
    └── functions/
        ├── server-time/            returns server clock + reveal time
        ├── verify-passcode/        time gate + PBKDF2 passcode check + rate limit; returns content + signed image URLs
        └── set-passcode/           owner-only passcode change
```

## Security model
- Passcode is never in frontend code or public tables: only a salted PBKDF2 hash in `passcode` (RLS on, no policies).
- ALL personal content tables are owner-only via RLS. Visitors receive content only from `verify-passcode`, and only after the reveal time (checked on the server) and a correct passcode.
- Photos/music buckets are private; visitors get 1-hour signed URLs.
- Reveal time is compared on the server; the browser clock is only used for smooth ticking.

## Setup (all in the browser)
1. supabase.com → New project. Note the Project URL and anon key (Project Settings → API).
2. SQL Editor → paste all of `supabase/migrations/001_schema.sql` → Run.
3. Authentication → Users → Add user (your email + password). Copy the user's UUID. SQL Editor → run
   `insert into owners(user_id) values ('YOUR-UUID');`
4. Edge Functions → Deploy a new function (via Editor) → create three functions named exactly `server-time`, `verify-passcode`, `set-passcode`; paste each `index.ts`. In each function's settings turn **off** "Verify JWT".
5. Copy `.env.example` to `.env` (VS Code: right-click → Rename / New File) and fill in the two values.
6. In a VS Code terminal in this folder: `npm install` then `npm run dev`.
7. Open `http://localhost:5173/#/admin`, sign in, set the passcode, replace every text, upload photos/music.
8. Open `#/preview` (signed in) to test the whole experience at any time.
9. Deploy: push to GitHub → Vercel/Netlify → Import project → add the two env vars → Deploy. Share the public URL.
   Make sure `Authentication → URL Configuration` lists your site URL.

## Owner guide
- Admin URL: `<your-site>/#/admin`. Dates there are in IST.
- Reveal: 28 Oct 2026 18:30 IST (stored as 13:00 UTC). Change in Site settings.
- Replay button returns to the welcome screen; it never touches data or the counter.
- Photos are auto-resized to 1600px WebP before upload.
