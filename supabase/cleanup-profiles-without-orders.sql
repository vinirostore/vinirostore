delete from public.profiles as profile
where not exists (
  select 1
  from public.orders as customer_order
  where customer_order.customer_id = profile.id
);