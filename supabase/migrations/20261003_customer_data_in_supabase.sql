alter table public.profiles
  add column if not exists addresses jsonb not null default '[]'::jsonb,
  add column if not exists notification_preferences jsonb not null default '{"serviceUpdates":true,"promos":true,"orderStatus":true}'::jsonb,
  add column if not exists payment_preferences jsonb not null default '{"method":"cashfree"}'::jsonb;

create table if not exists public.customer_shop_state (
  customer_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.customer_shop_state enable row level security;

create table if not exists public.guest_shop_state (
  guest_id uuid primary key,
  cart jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

alter table public.guest_shop_state enable row level security;
