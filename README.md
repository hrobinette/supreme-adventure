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

Snapshots are persisted through the `SnapshotStore` interface in `lib/storage.ts`.
The current implementation uses the browser's `localStorage`, so shared links open
in the same browser where they were created.

To enable cross-device sharing:

1. Create a Supabase project and a `snapshots` table:
   `id text primary key, created_at timestamptz, label text, deals jsonb`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your env.
3. Add a Supabase-backed `SnapshotStore` implementation and select it in
   `lib/storage.ts` when those env vars are present.

## Deploying

Push to GitHub and import the repo into Vercel. Set `APP_PASSWORD` (and any
Supabase vars) in the Vercel project settings.
