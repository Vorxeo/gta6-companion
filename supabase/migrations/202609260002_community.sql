-- Public reading, confirmed-member contribution, and moderation controls.
create table if not exists public.community_posts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 author_name text not null check (char_length(author_name) between 2 and 36),
 kind text not null check (kind in ('observation','theory','crew')),
 title text not null check (char_length(title) between 8 and 140),
 body text not null check (char_length(body) between 15 and 2000),
 source_url text check (source_url is null or (char_length(source_url) <= 500 and source_url ~ '^https://')),
 source_time integer check (source_time is null or source_time between 0 and 7200),
 platform text check (platform is null or platform in ('ps5','xbox','pc','unspecified')),
 language text check (language is null or language in ('en','es','pt-BR')),
 spoiler boolean not null default false,
 status text not null default 'published' check (status in ('published','hidden')),
 created_at timestamptz not null default now(),
 constraint evidence_source check (kind='crew' or source_url is not null)
);
create index if not exists community_posts_recent on public.community_posts (created_at desc) where status='published';
alter table public.community_posts enable row level security;
revoke all on public.community_posts from anon,authenticated;
grant select on public.community_posts to anon,authenticated;
grant insert on public.community_posts to authenticated;
create policy "Read published non-spoiler posts" on public.community_posts for select to anon using (status='published' and spoiler=false);
create policy "Members read published posts" on public.community_posts for select to authenticated using (status='published');
create policy "Create own community post" on public.community_posts for insert to authenticated with check ((select auth.uid())=user_id and status='published');
create or replace function public.limit_community_posts() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.user_id::text));
 new.created_at := now();
 if exists(select 1 from public.community_posts where user_id=new.user_id and created_at>now()-interval '1 minute') then raise exception 'Posting too fast'; end if;
 if (select count(*) from public.community_posts where user_id=new.user_id and created_at>now()-interval '1 hour')>=5 then raise exception 'Hourly post limit'; end if;
 return new;
end; $$;
revoke all on function public.limit_community_posts() from public,anon,authenticated;
create trigger limit_community_posts before insert on public.community_posts for each row execute function public.limit_community_posts();
create table if not exists public.community_votes (
 post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
alter table public.community_votes enable row level security;
revoke all on public.community_votes from anon,authenticated;
grant select on public.community_votes to anon,authenticated;
grant insert,delete on public.community_votes to authenticated;
create policy "Read votes" on public.community_votes for select to anon,authenticated using (true);
create policy "Vote as self" on public.community_votes for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Remove own vote" on public.community_votes for delete to authenticated using ((select auth.uid())=user_id);
create table if not exists public.community_reports (
 post_id uuid not null references public.community_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(post_id,user_id)
);
alter table public.community_reports enable row level security;
revoke all on public.community_reports from anon,authenticated;
grant insert on public.community_reports to authenticated;
create policy "Report as self" on public.community_reports for insert to authenticated with check ((select auth.uid())=user_id);
create or replace function public.hide_reported_post() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (select count(*) from public.community_reports where post_id=new.post_id)>=3 then
   update public.community_posts set status='hidden' where id=new.post_id;
 end if;
 return new;
end; $$;
revoke all on function public.hide_reported_post() from public,anon,authenticated;
create trigger hide_reported_post after insert on public.community_reports for each row execute function public.hide_reported_post();
