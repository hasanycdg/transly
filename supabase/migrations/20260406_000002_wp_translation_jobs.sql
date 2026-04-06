-- WordPress plugin translation job storage for backend API.
-- This table is intentionally separate from translation_runs/project_files
-- because WordPress payload jobs are not file-run scoped.

create table if not exists public.wp_translation_jobs (
  id uuid primary key default gen_random_uuid(),
  site_url text not null,
  post_id text not null,
  post_type text not null,
  source_language text not null,
  target_language text not null,
  status text not null default 'queued' check (
    status in ('queued', 'processing', 'completed', 'completed_with_warnings', 'failed')
  ),
  request_payload jsonb not null,
  response_payload jsonb,
  warnings jsonb not null default '[]'::jsonb,
  errors jsonb not null default '[]'::jsonb,
  provider text,
  attempts integer not null default 0 check (attempts >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_wp_translation_jobs_status_created
  on public.wp_translation_jobs (status, created_at desc);

create index if not exists idx_wp_translation_jobs_post_site
  on public.wp_translation_jobs (post_id, site_url, created_at desc);

create index if not exists idx_wp_translation_jobs_site_created
  on public.wp_translation_jobs (site_url, created_at desc);

drop trigger if exists set_wp_translation_jobs_updated_at on public.wp_translation_jobs;
create trigger set_wp_translation_jobs_updated_at
before update on public.wp_translation_jobs
for each row execute function public.set_updated_at();
