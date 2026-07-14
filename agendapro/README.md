# AgendaPro

Sistema de agendamento multi-prestador (mobile-first, tema dark estilo Apple "Titanium").
Front-end construído com **TanStack Start + React 19 + Vite 7 + Tailwind v4**.

Atualmente o app funciona 100% no navegador com estado persistido em `localStorage` (Zustand).
Abaixo estão as instruções para (1) hospedar na Vercel e (2) plugar um banco de dados real quando quiser evoluir do protótipo.

---

## 1. Rodar localmente

```bash
bun install       # ou: npm install
bun run dev       # abre http://localhost:8080
```

Build de produção:

```bash
bun run build
bun run start
```

---

## 2. Deploy na Vercel

O projeto é compatível com Vercel (TanStack Start + Nitro detectam o preset automaticamente).

### Opção A — via Dashboard
1. Faça push do projeto em um repositório GitHub/GitLab/Bitbucket.
2. Acesse https://vercel.com/new e importe o repositório.
3. Configurações (Vercel detecta sozinho, mas confirme):
   - **Framework Preset:** Other / Vite
   - **Build Command:** `bun run build` (ou `npm run build`)
   - **Output Directory:** `.output/public`
   - **Install Command:** `bun install` (ou `npm install`)
4. Clique em **Deploy**.

### Opção B — via CLI
```bash
npm i -g vercel
vercel            # primeiro deploy (preview)
vercel --prod     # deploy de produção
```

### Variáveis de ambiente
Como o protótipo não usa backend, nenhuma env var é necessária.
Quando conectar o banco (seção 3), adicione as variáveis em
`Vercel → Project Settings → Environment Variables`.

---

## 3. Banco de dados (quando quiser sair do localStorage)

Caminho recomendado: **Supabase** (Postgres gerenciado + Auth + Storage).

### 3.1 Criar o projeto
1. Vá em https://supabase.com → **New Project**.
2. Copie **Project URL** e **anon public key** (Settings → API).

### 3.2 Schema SQL — rode no SQL Editor do Supabase

```sql
-- PROVIDERS
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text,
  contact text not null,
  address text,
  logo_url text,
  rating numeric(2,1) default 5.0,
  created_at timestamptz default now()
);

-- SERVICES
create table public.services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null check (duration_minutes > 0),
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz default now()
);

-- WORKING HOURS
create table public.working_hours (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  enabled boolean not null default true,
  start_time time not null,
  end_time time not null,
  unique (provider_id, weekday)
);

-- PORTFOLIO
create table public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  url text not null,
  created_at timestamptz default now()
);

-- APPOINTMENTS
create type public.appointment_status as enum ('confirmed','cancelled','completed');

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  service_id  uuid not null references public.services(id)  on delete restrict,
  client_id   uuid references auth.users(id) on delete set null,
  client_name text not null,
  client_contact text not null,
  date  date not null,
  start_time time not null,
  end_time   time not null,
  status public.appointment_status not null default 'confirmed',
  created_at timestamptz default now()
);

create index on public.appointments (provider_id, date);
create index on public.appointments (client_id);
```

### 3.3 RLS mínimo

```sql
alter table public.providers        enable row level security;
alter table public.services         enable row level security;
alter table public.working_hours    enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.appointments     enable row level security;

create policy "public read providers"  on public.providers        for select using (true);
create policy "public read services"   on public.services         for select using (true);
create policy "public read hours"      on public.working_hours    for select using (true);
create policy "public read portfolio"  on public.portfolio_images for select using (true);

create policy "owner writes provider"  on public.providers
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "owner writes services"  on public.services
  for all using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()))
  with check  (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));

create policy "owner writes hours"     on public.working_hours
  for all using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()))
  with check  (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));

create policy "owner writes portfolio" on public.portfolio_images
  for all using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()))
  with check  (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));

create policy "client creates appt" on public.appointments
  for insert with check (auth.uid() = client_id or client_id is null);

create policy "read own appt" on public.appointments
  for select using (
    auth.uid() = client_id
    or exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid())
  );

create policy "provider updates appt" on public.appointments
  for update using (exists (select 1 from public.providers p where p.id = provider_id and p.owner_id = auth.uid()));
```

### 3.4 Conectar no app

```bash
bun add @supabase/supabase-js
```

Em `.env` (e nas envs da Vercel):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Depois substitua as leituras/gravações do `src/lib/store.ts` pelas chamadas
`supabase.from('providers').select()`, `.insert()`, etc.

> Dica: no próprio Lovable você pode clicar em **Enable Lovable Cloud** para
> provisionar Supabase + Auth automaticamente.

---

## 4. Estrutura do projeto

```
src/
  routes/       # páginas (TanStack Router file-based)
  components/   # BottomTab, Screen, ui/*
  lib/
    mock.ts     # seed de prestadores/serviços
    slots.ts    # cálculo de horários disponíveis
    store.ts    # Zustand + persist (trocar por Supabase)
  assets/       # logos e fotos de portfólio
  styles.css    # tokens de design (tema Titanium dark)
```

Perfis:
- **Cliente:** navega prestadores, escolhe serviço/horário, confirma via WhatsApp.
- **Prestador:** dashboard financeiro, agenda visual, CRUD de serviços, horários, portfólio e histórico.

Login demo: **Entrar → Cadastrar → Sou prestador**.
