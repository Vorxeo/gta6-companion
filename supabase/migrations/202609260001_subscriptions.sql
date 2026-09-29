-- The browser can read only its own subscription; it cannot grant itself access.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('active','trialing','past_due','canceled','unpaid','incomplete')),
  current_period_end timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;
grant all on table public.subscriptions to service_role;
create policy "Read own subscription" on public.subscriptions for select to authenticated using ((select auth.uid()) = user_id);
-- Writes belong to a future verified billing webhook, never user metadata or form fields.
