-- A project can run on several platforms (FLUX: phone and watch). Replaces the single `kind` with `platforms`.
-- Not applied automatically: run it once in the Supabase SQL editor. Until then the site maps `kind` to platforms
-- by itself (lib/supabase.ts), but /admin cannot save projects.
begin;

alter table public.projects add column if not exists platforms text[] not null default '{web}';

-- Carry over the old kind; "web-mobile" becomes web + mobile.
update public.projects
set platforms = case kind when 'web-mobile' then array['web', 'mobile'] else array[kind] end
where kind is not null;

-- Content updates that come with this change.
update public.projects set platforms = array['mobile'] where slug = 'luma';
update public.projects set platforms = array['mobile', 'wearable'] where slug = 'flux';

alter table public.projects
  add constraint projects_platforms_check
  check (cardinality(platforms) >= 1 and platforms <@ array['web', 'mobile', 'wearable', 'desktop', 'game', 'api']);

alter table public.projects drop constraint if exists projects_kind_check;
alter table public.projects drop column if exists kind;

-- New project (also in content/seed.json). Skipped if a project with this slug already exists.
insert into public.projects (slug, title, platforms, period, featured, summary, stack, repo_url, solution, "order")
values ('nexium', 'Nexium', array['desktop'], '2026-2', true,
  'Asistente de escritorio para Windows, macOS y Linux: entiende solicitudes en español por voz o texto y responde con datos reales del equipo (sistema, archivos, documentos, clima y recordatorios).',
  array['Tauri 2', 'Rust', 'React', 'TypeScript', 'Whisper', 'Gemini', 'SQLite', 'Cloudflare Workers'],
  'https://github.com/Daniel-I24/Nexium',
  'Los datos salen del equipo, no de un modelo: reglas locales resuelven lo simple, la IA solo interpreta la solicitud y la aplicación ejecuta funciones controladas. La voz se transcribe en el equipo con Whisper y la clave de Gemini vive solo en un servidor intermediario.',
  2)
on conflict (slug) do nothing;

commit;
