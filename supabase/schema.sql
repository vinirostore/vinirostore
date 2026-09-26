create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  security_question text,
  security_answer_hash text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists security_question text;
alter table public.profiles add column if not exists security_answer_hash text;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VINI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_name text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_pincode text not null,
  shipping_phone text not null,
  subtotal numeric(12,2) not null default 0,
  gst numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_slug text not null,
  product_image text not null,
  sku text not null,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id text primary key,
  name text not null,
  slug text not null unique,
  logo text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.models (
  id text primary key,
  name text not null,
  slug text not null,
  brand_id text not null references public.brands(id) on delete cascade,
  description text not null default '',
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  price numeric,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.models add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.models add column if not exists price numeric;
alter table public.models add column if not exists new_arrival boolean not null default false;
alter table public.models add column if not exists best_seller boolean not null default false;
alter table public.models add column if not exists featured boolean not null default false;
alter table public.models add column if not exists deal boolean not null default false;

create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  brand text not null,
  brand_id text references public.brands(id) on delete set null,
  model text,
  model_id text references public.models(id) on delete set null,
  model_slug text,
  price numeric(12,2) not null default 0,
  compare_at_price numeric(12,2),
  inventory integer not null default 0,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  description text not null default '',
  short_description text not null default '',
  badge text,
  featured boolean not null default false,
  new_arrival boolean not null default false,
  best_seller boolean not null default false,
  deal boolean not null default false,
  sku text not null,
  stock_status text not null default 'in-stock',
  status text not null default 'active' check (status in ('active', 'inactive')),
  specifications jsonb not null default '{}'::jsonb,
  features jsonb not null default '[]'::jsonb,
  technology text,
  capacity text,
  warranty text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists new_arrival boolean not null default false;
alter table public.products add column if not exists best_seller boolean not null default false;
alter table public.products add column if not exists deal boolean not null default false;

create table if not exists public.accessories (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  price numeric(12,2) not null default 0,
  stock integer not null default 0,
  image text not null,
  short_description text not null default '',
  description text not null default '',
  features jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.service_requests enable row level security;
alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.products enable row level security;
alter table public.accessories enable row level security;

drop policy if exists "Anyone can view catalog" on public.brands;
create policy "Anyone can view catalog" on public.brands for select using (true);
drop policy if exists "Anyone can view models" on public.models;
create policy "Anyone can view models" on public.models for select using (true);
drop policy if exists "Anyone can view products" on public.products;
create policy "Anyone can view products" on public.products for select using (true);
drop policy if exists "Anyone can view accessories" on public.accessories;
create policy "Anyone can view accessories" on public.accessories for select using (true);

drop policy if exists "Authenticated admins can manage brands" on public.brands;
create policy "Authenticated admins can manage brands" on public.brands for all using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com') with check (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Authenticated admins can manage models" on public.models;
create policy "Authenticated admins can manage models" on public.models for all using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com') with check (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Authenticated admins can manage products" on public.products;
create policy "Authenticated admins can manage products" on public.products for all using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com') with check (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Authenticated admins can manage accessories" on public.accessories;
create policy "Authenticated admins can manage accessories" on public.accessories for all using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com') with check (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');

drop policy if exists "Customers can view their profile" on public.profiles;
create policy "Customers can view their profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Customers can create their profile" on public.profiles;
create policy "Customers can create their profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Customers can update their profile" on public.profiles;
create policy "Customers can update their profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Customers can view their orders" on public.orders;
create policy "Customers can view their orders" on public.orders for select using (auth.uid() = customer_id);
drop policy if exists "Customers can create their orders" on public.orders;
create policy "Customers can create their orders" on public.orders for insert with check (auth.uid() = customer_id);

drop policy if exists "Customers can view their order items" on public.order_items;
create policy "Customers can view their order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = auth.uid()));
drop policy if exists "Customers can create their order items" on public.order_items;
create policy "Customers can create their order items" on public.order_items for insert with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = auth.uid()));

drop policy if exists "Customers can view their service requests" on public.service_requests;
create policy "Customers can view their service requests" on public.service_requests for select using (auth.uid() = customer_id);
drop policy if exists "Customers can create service requests" on public.service_requests;
create policy "Customers can create service requests" on public.service_requests for insert with check (auth.uid() = customer_id);
