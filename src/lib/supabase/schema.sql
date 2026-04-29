-- Esquema do Apoio Vivo (Supabase / Postgres).
-- Execute no SQL Editor do seu projeto Supabase.

-- Idoso monitorado (vinculado à conta do cuidador responsável)
create table if not exists idosos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  idade int,
  criado_em timestamptz default now()
);

-- Cuidadores / familiares que recebem os alertas
create table if not exists cuidadores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  parentesco text,
  email text not null,
  telefone text,
  criado_em timestamptz default now()
);

-- Registro de eventos/alertas enviados
create table if not exists alertas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null,
  descricao text,
  criado_em timestamptz default now()
);

-- Row Level Security: cada usuário só acessa os próprios dados
alter table idosos enable row level security;
alter table cuidadores enable row level security;
alter table alertas enable row level security;

create policy "donos_idosos" on idosos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "donos_cuidadores" on cuidadores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "donos_alertas" on alertas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
