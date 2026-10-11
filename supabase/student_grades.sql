-- Saves each student's subject grades so they only enter them once.
-- Run in Supabase -> SQL Editor.
create table if not exists student_grades (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grades jsonb not null,
  updated_at timestamptz default now()
);
alter table student_grades enable row level security;
create policy "Students can read own grades"
  on student_grades for select using (auth.uid() = user_id);
-- No insert/update policy on purpose: the server validates and writes grades.
