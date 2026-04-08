create table if not exists public.workspace_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  billing_cycle_id uuid references public.workspace_billing_cycles(id) on delete set null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  credit_pack_id text not null,
  credits bigint not null check (credits > 0),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_credit_purchases_workspace_created
  on public.workspace_credit_purchases (workspace_id, created_at desc);

drop trigger if exists set_workspace_credit_purchases_updated_at on public.workspace_credit_purchases;
create trigger set_workspace_credit_purchases_updated_at
before update on public.workspace_credit_purchases
for each row execute function public.set_updated_at();
