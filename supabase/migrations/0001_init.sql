-- =============================================================
-- Âmago Studio — Schema inicial
-- Execute no SQL Editor do Supabase (projeto novo).
-- Cobre: projetos, imagens, mensagens, propostas e briefings.
-- Inclui RLS e triggers de updated_at.
-- =============================================================

-- Extensão para gen_random_uuid()
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- Helper: updated_at automático
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================
-- PROJETOS
-- =============================================================
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  type         text not null,               -- 'Landing page' | 'Identidade visual' | 'Lançamento completo'
  client       text,
  year         text,
  summary      text,
  description  text,
  cover_url    text,
  external_url text,
  published    boolean not null default false,
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_published_position_idx
  on public.projects (published, position);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create table if not exists public.project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  url        text not null,
  alt        text,
  position   integer not null default 0
);

create index if not exists project_images_project_idx
  on public.project_images (project_id, position);

-- =============================================================
-- MENSAGENS (formulário de contato)
-- =============================================================
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- =============================================================
-- PROPOSTAS
-- =============================================================
create table if not exists public.proposals (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  client_name      text not null,
  client_email     text,
  client_company   text,
  project_id       uuid references public.projects(id) on delete set null,
  title            text not null,
  scope            text,                    -- rich text (HTML/markdown)
  payment_terms    text,
  general_terms    text,
  status           text not null default 'draft',  -- draft|sent|viewed|accepted|expired
  valid_until      date,
  first_viewed_at  timestamptz,
  accepted_at      timestamptz,
  accepted_by_name text,
  accepted_ip      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists proposals_set_updated_at on public.proposals;
create trigger proposals_set_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

create table if not exists public.proposal_deliverables (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  title       text not null,
  description text,
  position    integer not null default 0
);

create table if not exists public.proposal_timeline_steps (
  id                uuid primary key default gen_random_uuid(),
  proposal_id       uuid not null references public.proposals(id) on delete cascade,
  title             text not null,
  duration_estimate text,
  position          integer not null default 0
);

create table if not exists public.proposal_investment_items (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null default 0,
  position    integer not null default 0
);

create index if not exists proposal_deliverables_idx
  on public.proposal_deliverables (proposal_id, position);
create index if not exists proposal_timeline_idx
  on public.proposal_timeline_steps (proposal_id, position);
create index if not exists proposal_investment_idx
  on public.proposal_investment_items (proposal_id, position);

-- =============================================================
-- BRIEFINGS
-- =============================================================
create table if not exists public.briefing_templates (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  project_type text not null,
  created_at   timestamptz not null default now()
);

create table if not exists public.briefing_template_questions (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.briefing_templates(id) on delete cascade,
  label       text not null,
  field_type  text not null,   -- short_text|long_text|multiple_choice|checkbox|file|url
  options     jsonb,
  required    boolean not null default false,
  position    integer not null default 0
);

create table if not exists public.briefings (
  id           uuid primary key default gen_random_uuid(),
  token        text unique not null,
  client_name  text not null,
  client_email text,
  project_id   uuid references public.projects(id) on delete set null,
  template_id  uuid references public.briefing_templates(id) on delete set null,
  status       text not null default 'sent',  -- sent|in_progress|completed
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- Cópia das perguntas no momento do envio (editável por briefing).
create table if not exists public.briefing_questions (
  id          uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.briefings(id) on delete cascade,
  label       text not null,
  field_type  text not null,
  options     jsonb,
  required    boolean not null default false,
  position    integer not null default 0
);

create table if not exists public.briefing_answers (
  id          uuid primary key default gen_random_uuid(),
  briefing_id uuid not null references public.briefings(id) on delete cascade,
  question_id uuid not null references public.briefing_questions(id) on delete cascade,
  value       jsonb,
  updated_at  timestamptz not null default now(),
  unique (briefing_id, question_id)
);

create index if not exists briefing_template_questions_idx
  on public.briefing_template_questions (template_id, position);
create index if not exists briefing_questions_idx
  on public.briefing_questions (briefing_id, position);

drop trigger if exists briefing_answers_set_updated_at on public.briefing_answers;
create trigger briefing_answers_set_updated_at
  before update on public.briefing_answers
  for each row execute function public.set_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY
-- Regra geral:
--  - Conteúdo público (projetos publicados, envio de contato) via anon.
--  - Propostas e briefings NÃO são acessíveis via anon; o site lê/escreve
--    essas páginas públicas pelo servidor usando a service_role key
--    (que ignora RLS), filtrando por slug/token aleatório.
--  - Admin = qualquer usuário autenticado (não há signup público).
-- =============================================================
alter table public.projects                   enable row level security;
alter table public.project_images             enable row level security;
alter table public.messages                   enable row level security;
alter table public.proposals                  enable row level security;
alter table public.proposal_deliverables      enable row level security;
alter table public.proposal_timeline_steps    enable row level security;
alter table public.proposal_investment_items  enable row level security;
alter table public.briefing_templates         enable row level security;
alter table public.briefing_template_questions enable row level security;
alter table public.briefings                  enable row level security;
alter table public.briefing_questions         enable row level security;
alter table public.briefing_answers           enable row level security;

-- Projetos: leitura pública dos publicados; admin faz tudo.
create policy "projects_public_read" on public.projects
  for select to anon using (published = true);
create policy "projects_admin_all" on public.projects
  for all to authenticated using (true) with check (true);

-- Imagens: leitura pública quando o projeto está publicado; admin faz tudo.
create policy "project_images_public_read" on public.project_images
  for select to anon using (
    exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.published = true
    )
  );
create policy "project_images_admin_all" on public.project_images
  for all to authenticated using (true) with check (true);

-- Mensagens: qualquer um envia; só admin lê.
create policy "messages_public_insert" on public.messages
  for insert to anon with check (true);
create policy "messages_admin_read" on public.messages
  for select to authenticated using (true);

-- Propostas e filhos: apenas admin (o público passa pelo servidor c/ service_role).
create policy "proposals_admin_all" on public.proposals
  for all to authenticated using (true) with check (true);
create policy "proposal_deliverables_admin_all" on public.proposal_deliverables
  for all to authenticated using (true) with check (true);
create policy "proposal_timeline_admin_all" on public.proposal_timeline_steps
  for all to authenticated using (true) with check (true);
create policy "proposal_investment_admin_all" on public.proposal_investment_items
  for all to authenticated using (true) with check (true);

-- Briefings e filhos: apenas admin (o público passa pelo servidor c/ service_role).
create policy "briefing_templates_admin_all" on public.briefing_templates
  for all to authenticated using (true) with check (true);
create policy "briefing_template_questions_admin_all" on public.briefing_template_questions
  for all to authenticated using (true) with check (true);
create policy "briefings_admin_all" on public.briefings
  for all to authenticated using (true) with check (true);
create policy "briefing_questions_admin_all" on public.briefing_questions
  for all to authenticated using (true) with check (true);
create policy "briefing_answers_admin_all" on public.briefing_answers
  for all to authenticated using (true) with check (true);

-- =============================================================
-- STORAGE BUCKETS
-- =============================================================
insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('briefing-uploads', 'briefing-uploads', false)
on conflict (id) do nothing;

-- Bucket 'projects': leitura pública; escrita só admin.
create policy "projects_bucket_public_read" on storage.objects
  for select to anon using (bucket_id = 'projects');
create policy "projects_bucket_admin_write" on storage.objects
  for all to authenticated using (bucket_id = 'projects') with check (bucket_id = 'projects');

-- Bucket 'briefing-uploads': só admin (uploads públicos passam pelo servidor).
create policy "briefing_uploads_admin_all" on storage.objects
  for all to authenticated using (bucket_id = 'briefing-uploads') with check (bucket_id = 'briefing-uploads');
