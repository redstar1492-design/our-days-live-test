import { createClient } from '@/lib/supabase/client';

type JsonMap = Record<string, unknown>;

export type EventInput = {
  title: string;
  starts_at: string;
  ends_at?: string | null;
  location?: string | null;
  memo?: string | null;
  payload?: JsonMap;
};

export type DumpInput = {
  content: string;
  location?: string | null;
  place_type?: string | null;
  vibe?: string | null;
  rating?: number | null;
  payload?: JsonMap;
};

export type TodoInput = {
  title: string;
  due_at?: string | null;
  payload?: JsonMap;
};

async function sessionContext() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw userError ?? new Error('로그인이 필요합니다.');

  const { data: coupleId, error: coupleError } =
    await supabase.rpc('current_couple_id');

  if (coupleError) throw coupleError;
  if (!coupleId) throw new Error('커플 연결이 필요합니다.');

  return { supabase, userId: user.id, coupleId: coupleId as string };
}

function value<T>(data: T | null, error: unknown) {
  if (error) throw error;
  if (data === null) throw new Error('저장 결과를 확인할 수 없습니다.');
  return data;
}

export async function listEvents() {
  const { supabase } = await sessionContext();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  return value(data, error);
}

export async function createEvent(input: EventInput) {
  const { supabase, userId, coupleId } = await sessionContext();
  const { data, error } = await supabase
    .from('events')
    .insert({ ...input, author_id: userId, couple_id: coupleId })
    .select()
    .single();

  return value(data, error);
}

export async function updateEvent(id: string, input: Partial<EventInput>) {
  const { supabase } = await sessionContext();
  const { data, error } = await supabase
    .from('events')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return value(data, error);
}

export async function deleteEvent(id: string) {
  const { supabase } = await sessionContext();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export async function listDumps() {
  const { supabase } = await sessionContext();
  const { data, error } = await supabase
    .from('dumps')
    .select('*, dump_photos(*), dump_comments(*), dump_reactions(*)')
    .order('created_at', { ascending: false });

  return value(data, error);
}

export async function createDump(input: DumpInput) {
  const { supabase, userId, coupleId } = await sessionContext();
  const { data, error } = await supabase
    .from('dumps')
    .insert({ ...input, author_id: userId, couple_id: coupleId })
    .select()
    .single();

  return value(data, error);
}

export async function updateDump(id: string, input: Partial<DumpInput>) {
  const { supabase } = await sessionContext();
  const { data, error } = await supabase
    .from('dumps')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return value(data, error);
}

export async function deleteDump(id: string) {
  const { supabase } = await sessionContext();
  const { error } = await supabase.from('dumps').delete().eq('id', id);
  if (error) throw error;
}

export async function listTodos() {
  const { supabase } = await sessionContext();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  return value(data, error);
}

export async function createTodo(input: TodoInput) {
  const { supabase, userId, coupleId } = await sessionContext();
  const { data, error } = await supabase
    .from('todos')
    .insert({ ...input, author_id: userId, couple_id: coupleId })
    .select()
    .single();

  return value(data, error);
}

export async function updateTodo(
  id: string,
  input: Partial<TodoInput> & { completed?: boolean; completed_by?: string | null },
) {
  const { supabase } = await sessionContext();
  const { data, error } = await supabase
    .from('todos')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return value(data, error);
}

export async function deleteTodo(id: string) {
  const { supabase } = await sessionContext();
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) throw error;
}
