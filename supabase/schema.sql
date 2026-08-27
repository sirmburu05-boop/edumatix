-- Edumatix database schema (Supabase / Postgres)
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Then run seed_institutions.sql and seed_clusters.sql the same way.

-- ============================================================
-- INSTITUTIONS  (the 512 real KUCCPS-registered institutions)
-- ============================================================
create table if not exists institutions (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,          -- 'University' | 'College'
  type text not null,               -- 'Public' | 'Private'
  parent_ministry text,
  county text not null,
  website text,                     -- filled in later as researched
  created_at timestamptz default now()
);
create index if not exists idx_institutions_county on institutions (county);
create index if not exists idx_institutions_category on institutions (category);
create index if not exists idx_institutions_type on institutions (type);

-- ============================================================
-- CLUSTERS  (the 18 real KUCCPS degree clusters)
-- ============================================================
create table if not exists clusters (
  cluster_number int primary key,
  name text not null
);

-- ============================================================
-- PROGRAMMES  (consolidated canonical programme families)
-- ============================================================
create table if not exists programmes (
  id bigint generated always as identity primary key,
  cluster_number int references clusters(cluster_number),
  name text not null,               -- canonical merged name, e.g. "Bachelor of Laws (LLB)"
  minimum_mean_grade text,          -- e.g. 'C+'  (nullable until verified)
  minimum_subjects jsonb,           -- e.g. {"Biology":"B","Chemistry":"B"} (nullable until verified)
  minimum_verified boolean default false,
  source text,                      -- e.g. 'KMPDC', 'KUCCPS Cluster 13 detail page'
  created_at timestamptz default now()
);
create index if not exists idx_programmes_cluster on programmes (cluster_number);

-- ============================================================
-- INSTITUTION_PROGRAMMES  (which institution offers which programme,
-- plus historical cutoff points per year)
-- ============================================================
create table if not exists institution_programmes (
  id bigint generated always as identity primary key,
  institution_id bigint references institutions(id) on delete cascade,
  programme_id bigint references programmes(id) on delete cascade,
  cutoff_2018 numeric,
  cutoff_2019 numeric,
  cutoff_2020 numeric,
  cutoff_2021 numeric,
  cutoff_2022 numeric,
  cutoff_2023 numeric,
  cutoff_2024 numeric,
  unique (institution_id, programme_id)
);
create index if not exists idx_ip_institution on institution_programmes (institution_id);
create index if not exists idx_ip_programme on institution_programmes (programme_id);

-- ============================================================
-- PROFILES  (extends Supabase auth.users — built in the Auth phase,
-- created now so the schema is ready ahead of time)
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  curriculum text default '8-4-4',   -- '8-4-4' | 'CBC'
  activated boolean default false,   -- true once the 299 KSH payment clears
  created_at timestamptz default now()
);

-- Row Level Security: students can only read/write their own profile.
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Institutions, clusters, programmes, and cutoffs are public read data —
-- every visitor can browse them without logging in.
alter table institutions enable row level security;
alter table clusters enable row level security;
alter table programmes enable row level security;
alter table institution_programmes enable row level security;

create policy "Public read access" on institutions for select using (true);
create policy "Public read access" on clusters for select using (true);
create policy "Public read access" on programmes for select using (true);
create policy "Public read access" on institution_programmes for select using (true);
