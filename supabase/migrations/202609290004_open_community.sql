-- Restore free, confirmed-member participation. Existing rate limits and moderation remain.
alter table public.community_posts drop constraint if exists community_posts_language_check;
alter table public.community_posts add constraint community_posts_language_check
  check (language is null or language in ('en','es','pt-BR','nl'));
create or replace function public.is_confirmed_community_member()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from auth.users u where u.id = (select auth.uid()) and u.email_confirmed_at is not null)
$$;
revoke all on function public.is_confirmed_community_member() from public, anon, authenticated;
grant execute on function public.is_confirmed_community_member() to authenticated;
drop policy if exists "Paid members create own community post" on public.community_posts;
create policy "Confirmed members create own community post" on public.community_posts
  for insert to authenticated with check (
    (select auth.uid()) = user_id and status = 'published' and
    (select public.is_confirmed_community_member())
  );

create table if not exists public.community_poll_votes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  choice text not null check (choice in ('vice-city', 'keys', 'grassrivers')),
  created_at timestamptz not null default now()
);
alter table public.community_poll_votes enable row level security;
revoke all on public.community_poll_votes from anon, authenticated;
grant select on public.community_poll_votes to authenticated;
grant insert, update on public.community_poll_votes to authenticated;
create policy "Read own poll vote" on public.community_poll_votes
  for select to authenticated using ((select auth.uid()) = user_id);
create or replace function public.community_poll_results()
returns table(choice text, votes bigint) language sql stable security definer set search_path = '' as $$
  select v.choice, count(*) from public.community_poll_votes v group by v.choice
$$;
revoke all on function public.community_poll_results() from public, anon, authenticated;
grant execute on function public.community_poll_results() to anon, authenticated;
create policy "Vote in community poll" on public.community_poll_votes
  for insert to authenticated with check ((select auth.uid()) = user_id and (select public.is_confirmed_community_member()));
create policy "Change own community poll vote" on public.community_poll_votes
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (select public.is_confirmed_community_member()));
