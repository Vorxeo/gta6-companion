-- Expand-only billing storage. Apply after 202609260001_subscriptions.sql.
-- The app uses the Supabase service role only on the server for these writes.
alter table public.subscriptions add column if not exists provider text;
alter table public.subscriptions add column if not exists mollie_customer_id text;
alter table public.subscriptions add column if not exists mollie_subscription_id text;
alter table public.subscriptions add column if not exists currency text;
alter table public.subscriptions add column if not exists billing_interval text;
alter table public.subscriptions add column if not exists last_payment_id text;
alter table public.subscriptions add column if not exists canceled_at timestamptz;
create unique index if not exists subscriptions_mollie_id_unique on public.subscriptions(mollie_subscription_id) where mollie_subscription_id is not null;

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mollie_customer_id text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.billing_checkouts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id text not null,
  payment_id text unique,
  currency text not null check(currency in ('EUR','USD')),
  billing_interval text not null check(billing_interval in ('monthly','annual')),
  amount_cents integer not null check(amount_cents > 0),
  status text not null default 'creating' check(status in ('creating','open','paid','failed')),
  created_at timestamptz not null default now()
);
create index if not exists billing_checkouts_user_recent on public.billing_checkouts(user_id,created_at desc);
create unique index if not exists billing_checkouts_single_open_user on public.billing_checkouts(user_id)
  where status in ('creating','open');
create table if not exists public.billing_paid_payments (
  payment_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  paid_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;
alter table public.billing_checkouts enable row level security;
alter table public.billing_paid_payments enable row level security;
revoke all on public.billing_customers, public.billing_checkouts, public.billing_paid_payments from anon, authenticated;
grant all on public.billing_customers, public.billing_checkouts, public.billing_paid_payments to service_role;

create or replace function public.record_mollie_first_payment(
  p_checkout_id uuid, p_payment_id text, p_paid_at timestamptz, p_period_end timestamptz
) returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.billing_checkouts%rowtype;
begin
  select * into c from public.billing_checkouts where id=p_checkout_id for update;
  if not found or c.payment_id is distinct from p_payment_id or c.status='failed' or p_period_end<=p_paid_at then return false; end if;
  insert into public.billing_paid_payments(payment_id,user_id,paid_at) values(p_payment_id,c.user_id,p_paid_at)
    on conflict(payment_id) do nothing;
  if found then
    insert into public.subscriptions(user_id,status,current_period_end,provider,mollie_customer_id,currency,billing_interval,last_payment_id,updated_at)
      values(c.user_id,'active',p_period_end,'mollie',c.customer_id,c.currency,c.billing_interval,p_payment_id,now())
    on conflict(user_id) do update set
      status='active', current_period_end=greatest(public.subscriptions.current_period_end,excluded.current_period_end),
      provider='mollie', mollie_customer_id=excluded.mollie_customer_id, currency=excluded.currency,
      billing_interval=excluded.billing_interval, mollie_subscription_id=null,
      canceled_at=null, last_payment_id=excluded.last_payment_id, updated_at=now();
  end if;
  update public.billing_checkouts set status='paid' where id=p_checkout_id;
  return true;
end; $$;

create or replace function public.record_mollie_renewal(
  p_subscription_id text, p_customer_id text, p_payment_id text, p_paid_at timestamptz, p_period_end timestamptz
) returns boolean language plpgsql security definer set search_path = '' as $$
declare s public.subscriptions%rowtype;
begin
  select * into s from public.subscriptions where mollie_subscription_id=p_subscription_id and mollie_customer_id=p_customer_id and provider='mollie' for update;
  if not found or p_period_end<=p_paid_at then return false; end if;
  insert into public.billing_paid_payments(payment_id,user_id,paid_at) values(p_payment_id,s.user_id,p_paid_at)
    on conflict(payment_id) do nothing;
  if found then
    update public.subscriptions set current_period_end=greatest(current_period_end,p_period_end),
      status=case when status='canceled' then 'canceled' else 'active' end,
      last_payment_id=p_payment_id,updated_at=now()
      where user_id=s.user_id;
  end if;
  return true;
end; $$;

revoke all on function public.record_mollie_first_payment(uuid,text,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.record_mollie_renewal(text,text,text,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.record_mollie_first_payment(uuid,text,timestamptz,timestamptz) to service_role;
grant execute on function public.record_mollie_renewal(text,text,text,timestamptz,timestamptz) to service_role;
