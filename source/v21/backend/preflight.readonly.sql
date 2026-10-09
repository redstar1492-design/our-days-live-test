-- READ-ONLY review queries. This does not create tables or change privileges.
-- Run against a future local/staging database before adapting the review draft.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in (
  'profiles', 'couples', 'couple_members', 'events', 'dumps', 'todos',
  'notifications', 'collections', 'trips', 'trip_stops', 'collection_items'
)
order by tablename;

select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name in ('couple_members', 'events', 'dumps', 'todos')
order by table_name, ordinal_position;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
order by tablename, policyname;

select routine_name, security_type, routine_definition
from information_schema.routines
where routine_schema = 'public' and routine_name in ('join_couple_by_code', 'current_couple_id');

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

select pubname, schemaname, tablename from pg_publication_tables
where pubname = 'supabase_realtime' order by schemaname, tablename;
