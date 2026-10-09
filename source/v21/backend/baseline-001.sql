create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 20),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique
    default upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6)),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'partner')),
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  unique (user_id)
);

create or replace function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id
  from public.couple_members
  where user_id = auth.uid()
  limit 1
$$;

create or replace function public.add_couple_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.couple_members (couple_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger add_couple_owner_after_insert
after insert on public.couples
for each row execute function public.add_couple_owner();

create or replace function public.join_couple_by_code(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  if exists (
    select 1 from public.couple_members where user_id = auth.uid()
  ) then
    raise exception '이미 커플 공간에 연결되어 있습니다.';
  end if;

  select id into target_id
  from public.couples
  where invite_code = upper(trim(code));

  if target_id is null then
    raise exception '초대코드를 확인해 주세요.';
  end if;

  if (
    select count(*) from public.couple_members where couple_id = target_id
  ) >= 2 then
    raise exception '이미 연결이 완료된 초대코드입니다.';
  end if;

  insert into public.couple_members (couple_id, user_id, role)
  values (target_id, auth.uid(), 'partner');

  update public.couples
  set invite_code = upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6))
  where id = target_id;

  return target_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;

create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles_read_couple"
on public.profiles for select
using (
  id = auth.uid()
  or id in (
    select user_id from public.couple_members
    where couple_id = public.current_couple_id()
  )
);

create policy "profiles_update_self"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "couples_create_self"
on public.couples for insert
with check (created_by = auth.uid());

create policy "couples_read_member"
on public.couples for select
using (id = public.current_couple_id());

create policy "couples_update_member"
on public.couples for update
using (id = public.current_couple_id())
with check (id = public.current_couple_id());

create policy "members_read_same_couple"
on public.couple_members for select
using (
  user_id = auth.uid()
  or couple_id = public.current_couple_id()
);
