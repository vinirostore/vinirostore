create extension if not exists pgcrypto;

create table if not exists public.model_reviews (
  id uuid primary key default gen_random_uuid(),
  model_id text not null references public.models(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(trim(review)) between 10 and 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint model_reviews_model_user_key unique (model_id, user_id)
);

create index if not exists model_reviews_model_created_idx
  on public.model_reviews (model_id, created_at desc);

alter table public.model_reviews enable row level security;

drop policy if exists "Anyone can view model reviews" on public.model_reviews;
create policy "Anyone can view model reviews"
  on public.model_reviews for select using (true);

drop policy if exists "Customers can create their model reviews" on public.model_reviews;
create policy "Customers can create their model reviews"
  on public.model_reviews for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Customers can update their model reviews" on public.model_reviews;
create policy "Customers can update their model reviews"
  on public.model_reviews for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on public.model_reviews to anon, authenticated;
grant insert, update on public.model_reviews to authenticated;

notify pgrst, 'reload schema';
