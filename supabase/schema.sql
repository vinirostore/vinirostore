create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

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

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.service_requests enable row level security;

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
