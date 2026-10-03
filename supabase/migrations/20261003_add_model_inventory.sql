alter table public.models
  add column if not exists inventory integer not null default 0;