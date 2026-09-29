-- Widen the existing checkout currency constraint without changing prior data.
-- BRL payments require an enabled PayPal recurring method in the Mollie profile.
alter table public.billing_checkouts drop constraint if exists billing_checkouts_currency_check;
alter table public.billing_checkouts add constraint billing_checkouts_currency_check
  check (currency in ('EUR', 'USD', 'BRL'));
