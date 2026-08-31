-- repare.ja — schema inicial (MVP)
-- Rodar no SQL editor do Supabase. Requer extensão pgcrypto para gen_random_uuid().

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Usuários (perfil estendido sobre auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  is_technician boolean not null default false,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Categorias (hierárquicas: nicho -> subcategoria)
-- ---------------------------------------------------------------------
create table public.categories (
  id text primary key,
  name text not null,
  parent_id text references public.categories(id)
);

-- ---------------------------------------------------------------------
-- Perfis de técnico
-- ---------------------------------------------------------------------
create table public.technician_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  city text not null,
  state text not null,
  address text,
  lat double precision,
  lng double precision,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  plan_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.technician_categories (
  technician_id uuid references public.technician_profiles(id) on delete cascade,
  category_id text references public.categories(id) on delete cascade,
  primary key (technician_id, category_id)
);

-- ---------------------------------------------------------------------
-- Posts (vídeos / fotos de portfólio)
-- ---------------------------------------------------------------------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  technician_id uuid not null references public.technician_profiles(id) on delete cascade,
  category_id text references public.categories(id),
  title text not null,
  description text,
  media_type text not null check (media_type in ('video', 'photo')),
  media_url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Classificados (máquinas / peças novas ou usadas)
-- ---------------------------------------------------------------------
create table public.classified_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id text references public.categories(id),
  title text not null,
  description text,
  price numeric(10,2),
  condition text not null check (condition in ('novo', 'usado')),
  city text not null,
  state text not null,
  media_url text,
  status text not null default 'active' check (status in ('active', 'sold', 'removed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Avaliações / comentários (polimórfico: post ou classificado)
-- ---------------------------------------------------------------------
create table public.ratings_comments (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'classified_listing', 'technician_profile')),
  target_id uuid not null,
  stars smallint check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Denúncias (moderação reativa)
-- ---------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  reason text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Índices de apoio à busca (categoria + proximidade)
-- ---------------------------------------------------------------------
create index idx_technician_categories_category on public.technician_categories(category_id);
create index idx_technician_profiles_geo on public.technician_profiles(lat, lng);
create index idx_posts_technician on public.posts(technician_id);
create index idx_ratings_target on public.ratings_comments(target_type, target_id);

-- ---------------------------------------------------------------------
-- RLS (Row Level Security) — leitura pública, escrita restrita ao autor
-- ---------------------------------------------------------------------
alter table public.technician_profiles enable row level security;
alter table public.posts enable row level security;
alter table public.classified_listings enable row level security;
alter table public.ratings_comments enable row level security;
alter table public.reports enable row level security;

create policy "leitura publica" on public.technician_profiles for select using (true);
create policy "leitura publica" on public.posts for select using (true);
create policy "leitura publica" on public.classified_listings for select using (true);
create policy "leitura publica" on public.ratings_comments for select using (true);

create policy "dono edita seu perfil" on public.technician_profiles
  for update using (auth.uid() = id);
create policy "dono cria seus posts" on public.posts
  for insert with check (auth.uid() = technician_id);
create policy "dono edita seus posts" on public.posts
  for update using (auth.uid() = technician_id);
create policy "dono cria seus anuncios" on public.classified_listings
  for insert with check (auth.uid() = seller_id);
create policy "qualquer usuario autenticado comenta" on public.ratings_comments
  for insert with check (auth.uid() = author_id);
create policy "qualquer usuario autenticado denuncia" on public.reports
  for insert with check (true);

-- Seed inicial de categorias (Ferramentas Elétricas e Eletrodomésticos)
insert into public.categories (id, name, parent_id) values
  ('ferramentas-eletricas', 'Ferramentas Elétricas', null),
  ('esmerilhadeira', 'Esmerilhadeira', 'ferramentas-eletricas'),
  ('furadeira', 'Furadeira / Parafusadeira', 'ferramentas-eletricas'),
  ('serra-circular', 'Serra Circular / Tico-tico', 'ferramentas-eletricas'),
  ('lavadora-alta-pressao', 'Lavadora de Alta Pressão', 'ferramentas-eletricas'),
  ('eletrodomesticos', 'Eletrodomésticos', null),
  ('maquina-lavar', 'Máquina de Lavar', 'eletrodomesticos'),
  ('geladeira', 'Geladeira / Freezer', 'eletrodomesticos'),
  ('microondas', 'Micro-ondas', 'eletrodomesticos'),
  ('ar-condicionado', 'Ar-condicionado', 'eletrodomesticos');
