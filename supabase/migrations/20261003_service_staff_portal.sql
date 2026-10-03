create table if not exists public.service_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.service_staff enable row level security;

alter table public.service_requests
  add column if not exists completed_by uuid references public.service_staff(user_id) on delete set null,
  add column if not exists completed_by_name text,
  add column if not exists completed_at timestamptz;
