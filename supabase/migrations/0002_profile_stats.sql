-- Hero availability badge and the "Cifras clave" semester, both editable from /admin → Perfil.
-- RLS policies on public.profile already cover the new columns.
alter table public.profile
  add column if not exists availability text not null default '',
  add column if not exists semester smallint check (semester between 1 and 12);
