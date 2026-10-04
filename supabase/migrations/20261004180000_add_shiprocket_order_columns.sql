alter table public.orders
  add column if not exists shipping_state text not null default '',
  add column if not exists shiprocket_order_id text,
  add column if not exists shiprocket_shipment_id text,
  add column if not exists shiprocket_awb_code text,
  add column if not exists shiprocket_courier_name text,
  add column if not exists shiprocket_tracking_url text,
  add column if not exists shiprocket_payment_method text,
  add column if not exists cashfree_order_id text,
  add column if not exists cashfree_payment_id text,
  add column if not exists package_weight_kg numeric(8,3),
  add column if not exists package_length_cm numeric(8,2),
  add column if not exists package_breadth_cm numeric(8,2),
  add column if not exists package_height_cm numeric(8,2);

create unique index if not exists orders_cashfree_order_id_key
  on public.orders (cashfree_order_id)
  where cashfree_order_id is not null;

notify pgrst, 'reload schema';
