-- Meridian Sales Insights — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).

create table if not exists public.snapshots (
  id text primary key,
  created_at timestamptz not null default now(),
  label text not null,
  deals jsonb not null
);

-- Enable row level security and add NO policies. The app talks to Supabase
-- only from the server using the service-role key, which bypasses RLS. With
-- RLS on and no policies, the public/anon key cannot read or write this table.
alter table public.snapshots enable row level security;
