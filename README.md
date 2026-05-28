# Meridian Sales Insights

A Next.js + Tailwind app for uploading sales-pipeline CSVs and exploring shareable insights.

## Features

- **Login** — password gate (default `OPS123`, configurable via `APP_PASSWORD`).
- **Upload** — drag-and-drop a CSV in the Meridian deal schema; columns are validated.
- **Insights** — revenue over time, sales-rep performance, revenue by product line, win rate by lead source, and a time-to-close table by customer.
- **Share** — snapshot the current dataset and get a `/share/{id}` link. Storage is local-first today and swappable for Supabase.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with `OPS123`.

A sample file is included at `sample-data/meridian_sales.csv`.

## Configuration

Copy `.env.example` to `.env.local`:

```
APP_PASSWORD=OPS123
```

## Sharing & Supabase

The "Share" button on the insights page saves a snapshot and returns a
`/share/{id}` link. Persistence goes through server API routes
(`app/api/snapshots`) backed by Supabase, using a **server-only service-role
key** — no Supabase keys are ever sent to the browser. If Supabase isn't
configured, snapshots fall back to the browser's `localStorage` (same-browser
only), so the app always works.

To enable cross-device sharing:

1. In Supabase, open **SQL Editor** and run `supabase/schema.sql` to create the
   `snapshots` table (RLS enabled, no public policies — only the service role
   can access it).
2. In **Settings → API**, copy the **Project URL** and the **service_role**
   secret (not the anon key) into your env:
   ```
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
   ```
3. Restart `npm run dev`. New shares now persist to Supabase and open on any
   device.

On Vercel, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the project's
Environment Variables.

## Deploying

Push to GitHub and import the repo into Vercel. Set `APP_PASSWORD` (and any
Supabase vars) in the Vercel project settings.
