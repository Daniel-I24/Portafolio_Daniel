-- New project kinds: "web-mobile" (web app also shipped to Android/iOS) and "wearable" (Wear OS).
-- Not applied automatically: run it in the Supabase SQL editor before saving those kinds from /admin.
alter table public.projects drop constraint if exists projects_kind_check;
alter table public.projects
  add constraint projects_kind_check
  check (kind in ('web', 'web-mobile', 'mobile', 'wearable', 'api', 'desktop', 'game'));
