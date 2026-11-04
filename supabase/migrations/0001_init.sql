-- Portfolio schema: content tables, contact messages, RLS and the public-assets bucket.
-- Column names are the snake_case form of the Zod fields in lib/schemas.ts.
-- Initial content is not duplicated here: the admin dashboard imports content/seed.json.

-- Admin registry: RLS on with no policies, so only the security-definer function reads it.
create table public.admins (user_id uuid primary key references auth.users (id) on delete cascade);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table public.profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null, display_name text not null, tag text not null, role text not null,
  goal text not null default '', tagline text not null default '', location text not null default '',
  about text not null default '', photo text not null default '', cv_url text not null default '/cv.pdf',
  email text not null, socials jsonb not null default '[]', updated_at timestamptz not null default now()
);

create table public.projects (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique, title text not null,
  kind text not null default 'web' check (kind in ('web', 'mobile', 'api', 'desktop', 'game')),
  summary text not null default '', stack text[] not null default '{}',
  repo_url text not null default '', live_url text not null default '', live_label text not null default '',
  apk_url text not null default '', download_url text not null default '', extra_links jsonb not null default '[]',
  image_url text not null default '', featured boolean not null default false, collaboration boolean not null default false,
  period text not null default '', problem text not null default '', solution text not null default '',
  my_role text not null default '', learnings text not null default '', gallery text[] not null default '{}',
  github_repo text not null default '', stars integer not null default 0, year integer,
  "order" integer not null default 0, published boolean not null default true, created_at timestamptz not null default now()
);

create table public.testimonials (
  id text primary key default gen_random_uuid()::text,
  name text not null, role text not null default '', quote text not null, avatar_url text not null default '',
  "order" integer not null default 0, published boolean not null default true
);

create table public.experience (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('academic', 'work')), period text not null, title text not null,
  place text not null default '', summary text not null default '',
  "order" integer not null default 0, published boolean not null default true
);

create table public.skills (
  id text primary key default gen_random_uuid()::text,
  "group" text not null, name text not null, level smallint not null check (level between 1 and 3),
  "order" integer not null default 0, published boolean not null default true
);

create table public.interests (
  id text primary key default gen_random_uuid()::text,
  slug text not null check (slug in ('voley', 'futbol', 'motos', 'billar', 'musica', 'deporte')),
  title text not null, note text not null default '', playlist_url text not null default '',
  "order" integer not null default 0, published boolean not null default true
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  email text not null check (char_length(email) between 3 and 120),
  body text not null check (char_length(body) between 10 and 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: the public reads published rows; only the admin writes (and sees drafts).
do $$
declare t text;
begin
  foreach t in array array['projects', 'testimonials', 'experience', 'skills', 'interests'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public reads published" on public.%I for select using (published or public.is_admin())', t);
    execute format('create policy "admin inserts" on public.%I for insert with check (public.is_admin())', t);
    execute format('create policy "admin updates" on public.%I for update using (public.is_admin()) with check (public.is_admin())', t);
    execute format('create policy "admin deletes" on public.%I for delete using (public.is_admin())', t);
  end loop;
end $$;

alter table public.profile enable row level security;
create policy "public reads profile" on public.profile for select using (true);
create policy "admin writes profile" on public.profile for all using (public.is_admin()) with check (public.is_admin());

-- Messages: anyone may insert (the server action validates and rate-limits); only the admin reads.
alter table public.messages enable row level security;
create policy "anyone sends" on public.messages for insert to anon, authenticated with check (true);
create policy "admin reads" on public.messages for select using (public.is_admin());
create policy "admin updates" on public.messages for update using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes" on public.messages for delete using (public.is_admin());

-- Storage: CV, screenshots, APKs and testimonial photos. Public read, admin-only writes.
insert into storage.buckets (id, name, public, file_size_limit)
values ('public-assets', 'public-assets', true, 104857600)
on conflict (id) do nothing;

create policy "admin uploads" on storage.objects for insert to authenticated
  with check (bucket_id = 'public-assets' and public.is_admin());
create policy "admin replaces" on storage.objects for update to authenticated
  using (bucket_id = 'public-assets' and public.is_admin());
create policy "admin removes" on storage.objects for delete to authenticated
  using (bucket_id = 'public-assets' and public.is_admin());
