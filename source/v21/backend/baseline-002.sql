create table public.events (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  memo text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_join_requests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, requester_id)
);

create table public.dumps (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null default '',
  location text,
  place_type text,
  vibe text,
  rating smallint check (rating between 1 and 5),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dump_photos (
  id uuid primary key default gen_random_uuid(),
  dump_id uuid not null references public.dumps(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (dump_id, storage_path)
);

create table public.dump_comments (
  id uuid primary key default gen_random_uuid(),
  dump_id uuid not null references public.dumps(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dump_reactions (
  dump_id uuid not null references public.dumps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('heart', 'recognize')),
  created_at timestamptz not null default now(),
  primary key (dump_id, user_id, reaction)
);

create table public.todos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  completed boolean not null default false,
  completed_by uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  reference_id uuid,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index events_couple_starts_idx on public.events (couple_id, starts_at);
create index dumps_couple_created_idx on public.dumps (couple_id, created_at desc);
create index comments_dump_created_idx on public.dump_comments (dump_id, created_at);
create index todos_couple_created_idx on public.todos (couple_id, created_at desc);
create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

alter table public.events enable row level security;
alter table public.event_join_requests enable row level security;
alter table public.dumps enable row level security;
alter table public.dump_photos enable row level security;
alter table public.dump_comments enable row level security;
alter table public.dump_reactions enable row level security;
alter table public.todos enable row level security;
alter table public.notifications enable row level security;

create policy "events_read_couple" on public.events for select
using (couple_id = public.current_couple_id());
create policy "events_create_member" on public.events for insert
with check (couple_id = public.current_couple_id() and author_id = auth.uid());
create policy "events_update_author" on public.events for update
using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "events_delete_author" on public.events for delete
using (author_id = auth.uid());

create policy "event_requests_read_couple" on public.event_join_requests for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.couple_id = public.current_couple_id()
  )
);
create policy "event_requests_create_self" on public.event_join_requests for insert
with check (
  requester_id = auth.uid()
  and exists (
    select 1 from public.events e
    where e.id = event_id and e.couple_id = public.current_couple_id()
  )
);
create policy "event_requests_update_participant" on public.event_join_requests for update
using (
  requester_id = auth.uid()
  or exists (
    select 1 from public.events e
    where e.id = event_id and e.author_id = auth.uid()
  )
);

create policy "dumps_read_couple" on public.dumps for select
using (couple_id = public.current_couple_id());
create policy "dumps_create_member" on public.dumps for insert
with check (couple_id = public.current_couple_id() and author_id = auth.uid());
create policy "dumps_update_author" on public.dumps for update
using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "dumps_delete_author" on public.dumps for delete
using (author_id = auth.uid());

create policy "dump_photos_read_couple" on public.dump_photos for select
using (
  exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.couple_id = public.current_couple_id()
  )
);
create policy "dump_photos_manage_author" on public.dump_photos for all
using (
  exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.author_id = auth.uid()
  )
);

create policy "dump_comments_read_couple" on public.dump_comments for select
using (
  exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.couple_id = public.current_couple_id()
  )
);
create policy "dump_comments_create_member" on public.dump_comments for insert
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.couple_id = public.current_couple_id()
  )
);
create policy "dump_comments_update_author" on public.dump_comments for update
using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "dump_comments_delete_author" on public.dump_comments for delete
using (author_id = auth.uid());

create policy "dump_reactions_read_couple" on public.dump_reactions for select
using (
  exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.couple_id = public.current_couple_id()
  )
);
create policy "dump_reactions_create_self" on public.dump_reactions for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.dumps d
    where d.id = dump_id and d.couple_id = public.current_couple_id()
  )
);
create policy "dump_reactions_delete_self" on public.dump_reactions for delete
using (user_id = auth.uid());

create policy "todos_read_couple" on public.todos for select
using (couple_id = public.current_couple_id());
create policy "todos_create_member" on public.todos for insert
with check (couple_id = public.current_couple_id() and author_id = auth.uid());
create policy "todos_update_couple" on public.todos for update
using (couple_id = public.current_couple_id())
with check (couple_id = public.current_couple_id());
create policy "todos_delete_author" on public.todos for delete
using (author_id = auth.uid());

create policy "notifications_read_recipient" on public.notifications for select
using (recipient_id = auth.uid());
create policy "notifications_update_recipient" on public.notifications for update
using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
