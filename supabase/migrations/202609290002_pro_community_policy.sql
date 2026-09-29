-- Apply with the billing migration before enabling paid checkout.
-- Direct Supabase inserts must obey the same entitlement rule as the server action.
drop policy if exists "Create own community post" on public.community_posts;
create policy "Paid members create own community post" on public.community_posts
  for insert to authenticated with check (
    (select auth.uid()) = user_id and status = 'published' and
    exists (select 1 from public.subscriptions s where s.user_id = (select auth.uid())
      and s.provider = 'mollie' and s.status in ('active','canceled')
      and s.current_period_end > now())
  );
