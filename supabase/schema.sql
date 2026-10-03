create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  security_question text,
  security_answer_hash text,
  addresses jsonb not null default '[]'::jsonb,
  notification_preferences jsonb not null default '{"serviceUpdates":true,"promos":true,"orderStatus":true}'::jsonb,
  payment_preferences jsonb not null default '{"method":"cashfree"}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists security_question text;
alter table public.profiles add column if not exists security_answer_hash text;
alter table public.profiles add column if not exists addresses jsonb not null default '[]'::jsonb;
alter table public.profiles add column if not exists notification_preferences jsonb not null default '{"serviceUpdates":true,"promos":true,"orderStatus":true}'::jsonb;
alter table public.profiles add column if not exists payment_preferences jsonb not null default '{"method":"cashfree"}'::jsonb;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VINI-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  shipping_name text not null,
  shipping_address text not null,
  shipping_city text not null,
  shipping_state text not null default '',
  shipping_pincode text not null,
  shipping_phone text not null,
  shiprocket_order_id text,
  shiprocket_shipment_id text,
  shiprocket_awb_code text,
  shiprocket_courier_name text,
  shiprocket_tracking_url text,
  shiprocket_payment_method text,
  cashfree_order_id text,
  cashfree_payment_id text,
  package_weight_kg numeric(8,3),
  package_length_cm numeric(8,2),
  package_breadth_cm numeric(8,2),
  package_height_cm numeric(8,2),
  subtotal numeric(12,2) not null default 0,
  gst numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_shop_state (
  customer_id uuid primary key references auth.users(id) on delete cascade,
  cart jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_shop_state (
  guest_id uuid primary key,
  cart jsonb not null default '[]'::jsonb,
  wishlist jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

alter table public.orders add column if not exists shipping_state text not null default '';
alter table public.orders add column if not exists shiprocket_order_id text;
alter table public.orders add column if not exists shiprocket_shipment_id text;
alter table public.orders add column if not exists shiprocket_awb_code text;
alter table public.orders add column if not exists shiprocket_courier_name text;
alter table public.orders add column if not exists shiprocket_tracking_url text;
alter table public.orders add column if not exists shiprocket_payment_method text;
alter table public.orders add column if not exists cashfree_order_id text;
alter table public.orders add column if not exists cashfree_payment_id text;
alter table public.orders add column if not exists package_weight_kg numeric(8,3);
alter table public.orders add column if not exists package_length_cm numeric(8,2);
alter table public.orders add column if not exists package_breadth_cm numeric(8,2);
alter table public.orders add column if not exists package_height_cm numeric(8,2);
create unique index if not exists orders_cashfree_order_id_key on public.orders(cashfree_order_id) where cashfree_order_id is not null;

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

create table if not exists public.service_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete cascade,
  request_type text not null default 'enquiry' check (request_type in ('service', 'amc', 'enquiry')),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  city text,
  address text,
  qr_value text not null unique default gen_random_uuid()::text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  completed_by uuid references public.service_staff(user_id) on delete set null,
  completed_by_name text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.service_requests alter column customer_id drop not null;
alter table public.service_requests drop constraint if exists service_requests_customer_id_fkey;
alter table public.service_requests add constraint service_requests_customer_id_fkey foreign key (customer_id) references auth.users(id) on delete cascade;
alter table public.service_requests add column if not exists request_type text not null default 'enquiry';
alter table public.service_requests add column if not exists city text;
alter table public.service_requests add column if not exists address text;
alter table public.service_requests add column if not exists qr_value text;
update public.service_requests set qr_value = gen_random_uuid()::text where qr_value is null;
alter table public.service_requests alter column qr_value set default gen_random_uuid()::text;
alter table public.service_requests alter column qr_value set not null;
create unique index if not exists service_requests_qr_value_key on public.service_requests(qr_value);
alter table public.service_requests drop constraint if exists service_requests_request_type_check;
alter table public.service_requests add constraint service_requests_request_type_check check (request_type in ('service', 'amc', 'enquiry'));

alter table public.service_staff enable row level security;

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
  colors jsonb not null default '[]'::jsonb,
  price numeric,
  inventory integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.models add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.models add column if not exists colors jsonb not null default '[]'::jsonb;
alter table public.models add column if not exists price numeric;
alter table public.models add column if not exists inventory integer not null default 0;
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
alter table public.customer_shop_state enable row level security;
alter table public.guest_shop_state enable row level security;
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
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');

drop policy if exists "Customers can view their orders" on public.orders;
create policy "Customers can view their orders" on public.orders for select using (auth.uid() = customer_id);
drop policy if exists "Customers can create their orders" on public.orders;
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders" on public.orders for select using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders" on public.orders for update using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com') with check (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');

drop policy if exists "Customers can view their order items" on public.order_items;
create policy "Customers can view their order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = auth.uid()));
drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items" on public.order_items for select using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Customers can create their order items" on public.order_items;

drop policy if exists "Customers can view their service requests" on public.service_requests;
create policy "Customers can view their service requests" on public.service_requests for select using (auth.uid() = customer_id);
drop policy if exists "Admins can view all service requests" on public.service_requests;
create policy "Admins can view all service requests" on public.service_requests for select using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Admins can update all service requests" on public.service_requests;
create policy "Admins can update all service requests" on public.service_requests for update using (auth.jwt() ->> 'email' = 'vinirostore@gmail.com') with check (auth.jwt() ->> 'email' = 'vinirostore@gmail.com');
drop policy if exists "Customers can create service requests" on public.service_requests;
create policy "Customers can create service requests" on public.service_requests for insert with check (auth.uid() = customer_id);
