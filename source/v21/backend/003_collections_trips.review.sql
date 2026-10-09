-- REVIEW DRAFT ONLY — never applied by the HTML or a build script.
-- Requires reviewed replacements for the legacy 001/002 auth and RLS policies.
-- No client write grants: atomic authenticated writer RPCs are NOT implemented.
-- Baseline: next-app/supabase/migrations/001_auth_and_couples.sql and 002_shared_content.sql.
begin;

do $preflight$
begin
  if to_regclass('public.couple_members') is null
     or to_regclass('public.dumps') is null
     or to_regclass('public.events') is null
     or to_regclass('public.todos') is null then
    raise exception 'Review and install the authenticated baseline first';
  end if;
end
$preflight$;

-- New namespace for helpers only. Do not expose this schema in the Data API.
create schema dump_private;
revoke all on schema dump_private from public;
grant usage on schema dump_private to authenticated, service_role;

create function dump_private.is_couple_member(target_couple_id uuid)
returns boolean language sql stable security definer
set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.couple_members m
    where m.couple_id = target_couple_id and m.user_id = auth.uid()
  )
$$;
revoke all on function dump_private.is_couple_member(uuid) from public, anon;
grant execute on function dump_private.is_couple_member(uuid) to authenticated, service_role;

-- Composite FKs prevent linking a record from a different couple.
alter table public.dumps add constraint dumps_id_couple_unique unique (id, couple_id);
alter table public.events add constraint events_id_couple_unique unique (id, couple_id);
alter table public.todos add constraint todos_id_couple_unique unique (id, couple_id);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  kind text not null check (kind in ('collection', 'trip')),
  note text not null default '' check (char_length(note) <= 4000),
  created_by uuid not null references auth.users(id) on delete restrict,
  revision bigint not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, couple_id),
  unique (id, couple_id, kind)
);

create table public.trips (
  collection_id uuid primary key,
  couple_id uuid not null,
  collection_kind text not null default 'trip' check (collection_kind = 'trip'),
  start_date date not null,
  end_date date not null,
  event_id uuid not null unique,
  check (end_date >= start_date),
  unique (collection_id, couple_id),
  foreign key (collection_id, couple_id, collection_kind)
    references public.collections(id, couple_id, kind) on delete cascade,
  foreign key (event_id, couple_id)
    references public.events(id, couple_id) on delete restrict
);

create table public.trip_stops (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null,
  couple_id uuid not null,
  stop_date date not null,
  position integer not null check (position >= 0),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  url text check (url is null or (char_length(url) <= 2048 and url ~* '^https?://')),
  note text not null default '' check (char_length(note) <= 4000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (collection_id, couple_id)
    references public.trips(collection_id, couple_id) on delete cascade,
  unique (collection_id, stop_date, position) deferrable initially deferred
);

-- A v21 item belongs to at most one collection. No polymorphic unchecked IDs.
-- Unlinking or deleting a collection does not delete the original content.
create table public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null,
  couple_id uuid not null,
  dump_id uuid unique,
  event_id uuid unique,
  todo_id uuid unique,
  added_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check (num_nonnulls(dump_id, event_id, todo_id) = 1),
  foreign key (collection_id, couple_id)
    references public.collections(id, couple_id) on delete cascade,
  foreign key (dump_id, couple_id)
    references public.dumps(id, couple_id) on delete cascade,
  foreign key (event_id, couple_id)
    references public.events(id, couple_id) on delete cascade,
  foreign key (todo_id, couple_id)
    references public.todos(id, couple_id) on delete cascade
);

create index collections_couple_updated_idx on public.collections(couple_id, updated_at desc, id);
create index trip_stops_order_idx on public.trip_stops(collection_id, stop_date, position);
create index collection_items_collection_idx on public.collection_items(collection_id, created_at, id);

-- Deferred validation allows an atomic trip-date + stop-date update.
create function dump_private.validate_trip_dates()
returns trigger language plpgsql set search_path = ''
as $$
declare
  target_id uuid;
begin
  target_id := new.collection_id;
  if exists (
    select 1 from public.trips t
    join public.trip_stops s on s.collection_id = t.collection_id
    where t.collection_id = target_id
      and (s.stop_date < t.start_date or s.stop_date > t.end_date)
  ) then
    raise exception using errcode = '23514', message = 'Stop date is outside the trip';
  end if;
  return null;
end
$$;
revoke all on function dump_private.validate_trip_dates() from public, anon, authenticated;
create constraint trigger trip_stops_dates_valid
after insert or update on public.trip_stops
deferrable initially deferred for each row
execute function dump_private.validate_trip_dates();
create constraint trigger trips_dates_valid
after insert or update on public.trips
deferrable initially deferred for each row
execute function dump_private.validate_trip_dates();

alter table public.collections enable row level security;
alter table public.trips enable row level security;
alter table public.trip_stops enable row level security;
alter table public.collection_items enable row level security;

revoke all on public.collections, public.trips, public.trip_stops, public.collection_items
  from public, anon, authenticated;
grant select on public.collections, public.trips, public.trip_stops, public.collection_items
  to authenticated;

create policy collections_read_member on public.collections for select to authenticated
using (dump_private.is_couple_member(couple_id));
create policy collections_insert_self on public.collections for insert to authenticated
with check (created_by = (select auth.uid()) and dump_private.is_couple_member(couple_id));
create policy collections_update_member on public.collections for update to authenticated
using (dump_private.is_couple_member(couple_id))
with check (dump_private.is_couple_member(couple_id));
create policy collections_delete_creator on public.collections for delete to authenticated
using (created_by = (select auth.uid()) and dump_private.is_couple_member(couple_id));

create policy trips_read_member on public.trips for select to authenticated
using (dump_private.is_couple_member(couple_id));
create policy trips_insert_member on public.trips for insert to authenticated
with check (dump_private.is_couple_member(couple_id));
create policy trips_update_member on public.trips for update to authenticated
using (dump_private.is_couple_member(couple_id))
with check (dump_private.is_couple_member(couple_id));
create policy trips_delete_creator on public.trips for delete to authenticated
using (exists (
  select 1 from public.collections c where c.id = collection_id
    and c.created_by = (select auth.uid()) and dump_private.is_couple_member(c.couple_id)
));

create policy trip_stops_read_member on public.trip_stops for select to authenticated
using (dump_private.is_couple_member(couple_id));
create policy trip_stops_insert_self on public.trip_stops for insert to authenticated
with check (created_by = (select auth.uid()) and dump_private.is_couple_member(couple_id));
create policy trip_stops_update_member on public.trip_stops for update to authenticated
using (dump_private.is_couple_member(couple_id))
with check (dump_private.is_couple_member(couple_id));
create policy trip_stops_delete_member on public.trip_stops for delete to authenticated
using (dump_private.is_couple_member(couple_id));

create policy collection_items_read_member on public.collection_items for select to authenticated
using (dump_private.is_couple_member(couple_id));
create policy collection_items_insert_self on public.collection_items for insert to authenticated
with check (added_by = (select auth.uid()) and dump_private.is_couple_member(couple_id));
create policy collection_items_update_member on public.collection_items for update to authenticated
using (dump_private.is_couple_member(couple_id))
with check (dump_private.is_couple_member(couple_id));
create policy collection_items_delete_member on public.collection_items for delete to authenticated
using (dump_private.is_couple_member(couple_id));

-- No auth login, invitation RPC, collection writer RPC, realtime publication,
-- storage bucket, chat table, notification delivery, or server deployment here.
commit;
