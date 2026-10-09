-- Phase 3c: payments table + SECURITY FIX for the activated flag.
-- Run once in Supabase -> SQL Editor.

-- 1) SECURITY FIX: the original policy let a student UPDATE their own profile row,
--    which means anyone could set activated = true from the browser console.
--    Remove it and allow students to change only harmless columns.
drop policy if exists "Users can update own profile" on profiles;
revoke update on profiles from anon, authenticated;
grant update (full_name, curriculum) on profiles to authenticated;
create policy "Users can update own profile details"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2) Payments ledger (written ONLY by the server using the service-role key)
create table if not exists payments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  phone text not null,
  amount numeric not null,
  merchant_request_id text,
  checkout_request_id text unique,
  status text not null default 'pending',   -- pending | success | failed | cancelled
  mpesa_receipt text,
  result_code int,
  result_desc text,
  created_at timestamptz default now(),
  completed_at timestamptz
);
create index if not exists idx_payments_user on payments (user_id);
alter table payments enable row level security;
create policy "Users can view own payments"
  on payments for select using (auth.uid() = user_id);
-- no insert/update policies on purpose: only the service role (server) writes here.
