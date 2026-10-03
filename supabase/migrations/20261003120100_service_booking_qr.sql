alter table public.service_requests alter column customer_id drop not null;
alter table public.service_requests drop constraint if exists service_requests_customer_id_fkey;
alter table public.service_requests
  add constraint service_requests_customer_id_fkey
  foreign key (customer_id) references auth.users(id) on delete cascade;

alter table public.service_requests
  add column if not exists request_type text not null default 'enquiry';
alter table public.service_requests
  add column if not exists city text;
alter table public.service_requests
  add column if not exists address text;
alter table public.service_requests
  add column if not exists qr_value text;

update public.service_requests
set qr_value = gen_random_uuid()::text
where qr_value is null;

alter table public.service_requests
  alter column qr_value set default gen_random_uuid()::text;
alter table public.service_requests
  alter column qr_value set not null;

create unique index if not exists service_requests_qr_value_key
  on public.service_requests(qr_value);

alter table public.service_requests
  drop constraint if exists service_requests_request_type_check;
alter table public.service_requests
  add constraint service_requests_request_type_check
  check (request_type in ('service', 'amc', 'enquiry'));
