-- =============================================================
-- Âmago Studio — Seed de exemplo
-- Rode DEPOIS de 0001_init.sql. Idempotente por slug/token.
-- =============================================================

-- ---------- PROJETOS ----------
insert into public.projects (slug, title, type, client, year, summary, description, cover_url, external_url, published, position)
values
  ('nova-financas', 'Nova Finanças', 'Landing page', 'Nova', '2025',
   'Landing de captação para uma fintech de investimentos. Foco em confiança e clareza de proposta.',
   'Projeto de landing page para captação de leads da Nova, uma fintech de investimentos. O desafio era transmitir confiança e simplicidade em uma página única.',
   'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
   'https://example.com', true, 0),
  ('raiz-cafe', 'Raíz Café', 'Identidade visual', 'Raíz', '2024',
   'Identidade completa para uma torrefação artesanal — do símbolo às embalagens.',
   'Criação de identidade visual completa para a Raíz Café, incluindo símbolo, tipografia, paleta e sistema de embalagens.',
   'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
   null, true, 1),
  ('orbita-lancamento', 'Órbita — Lançamento', 'Lançamento completo', 'Órbita', '2025',
   'Lançamento de um curso online: posicionamento, identidade e páginas de venda.',
   'Lançamento completo do curso Órbita: posicionamento, identidade visual, páginas de venda e materiais de divulgação.',
   'https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80',
   null, true, 2),
  ('verten-studio', 'Vertèn', 'Identidade visual', 'Vertèn', '2024',
   'Marca minimalista para um studio de arquitetura de interiores.',
   'Identidade visual minimalista para a Vertèn, studio de arquitetura de interiores.',
   'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
   null, true, 3)
on conflict (slug) do nothing;

-- Imagens extras para um projeto de fluxo completo (Raíz Café).
insert into public.project_images (project_id, url, alt, position)
select p.id, x.url, x.alt, x.position
from public.projects p
join (values
  ('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80', 'Aplicação da marca em xícara', 0),
  ('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80', 'Embalagem de café', 1)
) as x(url, alt, position) on true
where p.slug = 'raiz-cafe'
and not exists (select 1 from public.project_images pi where pi.project_id = p.id);

-- ---------- PROPOSTA DE EXEMPLO ----------
with prop as (
  insert into public.proposals
    (slug, client_name, client_email, client_company, title, scope, payment_terms, general_terms, status, valid_until)
  values
    ('proposta-exemplo-orbita', 'Marina Alves', 'marina@orbita.com', 'Órbita', 'Lançamento completo — Órbita',
     '<p>Desenvolvimento de identidade visual e páginas de venda para o lançamento do curso Órbita, do conceito à entrega.</p>',
     '50% na aprovação, 50% na entrega final. Pagamento via PIX ou transferência.',
     'Proposta válida por 15 dias. Inclui 2 rodadas de ajustes por entregável. Prazos contam a partir da aprovação e do envio do briefing.',
     'sent', (now() + interval '15 days')::date)
  on conflict (slug) do nothing
  returning id
)
insert into public.proposal_deliverables (proposal_id, title, description, position)
select id, d.title, d.description, d.position from prop
join (values
  ('Identidade visual', 'Logo, paleta, tipografia e manual essencial.', 0),
  ('Landing de vendas', 'Página de vendas responsiva, do argumento ao pixel.', 1),
  ('Kit de divulgação', 'Peças para redes sociais e e-mail.', 2)
) as d(title, description, position) on true;

insert into public.proposal_timeline_steps (proposal_id, title, duration_estimate, position)
select p.id, t.title, t.duration, t.position
from public.proposals p
join (values
  ('Briefing e kickoff', '3 dias', 0),
  ('Identidade visual', '10 dias', 1),
  ('Landing + kit', '12 dias', 2),
  ('Revisões e entrega', '5 dias', 3)
) as t(title, duration, position) on true
where p.slug = 'proposta-exemplo-orbita'
and not exists (select 1 from public.proposal_timeline_steps s where s.proposal_id = p.id);

insert into public.proposal_investment_items (proposal_id, description, amount, position)
select p.id, i.description, i.amount, i.position
from public.proposals p
join (values
  ('Identidade visual', 4500.00, 0),
  ('Landing de vendas', 3800.00, 1),
  ('Kit de divulgação', 1200.00, 2)
) as i(description, amount, position) on true
where p.slug = 'proposta-exemplo-orbita'
and not exists (select 1 from public.proposal_investment_items ii where ii.proposal_id = p.id);

-- ---------- TEMPLATE + BRIEFING DE EXEMPLO ----------
with tpl as (
  insert into public.briefing_templates (name, project_type)
  values ('Briefing — Landing page', 'Landing page')
  returning id
)
insert into public.briefing_template_questions (template_id, label, field_type, options, required, position)
select id, q.label, q.field_type, q.options::jsonb, q.required, q.position from tpl
join (values
  ('Qual o objetivo principal da landing page?', 'long_text', null, true, 0),
  ('Quem é o público-alvo?', 'long_text', null, true, 1),
  ('Qual a ação principal que o visitante deve tomar?', 'multiple_choice', '["Comprar","Agendar","Cadastrar e-mail","Falar no WhatsApp"]', true, 2),
  ('Tem referências visuais? (links)', 'url', null, false, 3),
  ('Já tem identidade visual?', 'checkbox', null, false, 4),
  ('Envie logos ou materiais existentes', 'file', null, false, 5)
) as q(label, field_type, options, required, position) on true;

-- Briefing enviado para um cliente, copiando as perguntas do template.
with b as (
  insert into public.briefings (token, client_name, client_email, template_id, status)
  select 'briefing-exemplo-nova', 'João Nova', 'joao@nova.com', t.id, 'sent'
  from public.briefing_templates t
  where t.name = 'Briefing — Landing page'
  limit 1
  returning id, template_id
)
insert into public.briefing_questions (briefing_id, label, field_type, options, required, position)
select b.id, tq.label, tq.field_type, tq.options, tq.required, tq.position
from b
join public.briefing_template_questions tq on tq.template_id = b.template_id;
