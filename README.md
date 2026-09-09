# Âmago Studio

Site institucional + portfólio do **Âmago Studio** — studio de design focado em negócios digitais.

> _Design que vai direto ao ponto._

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + Storage + Auth) — _em construção_
- Deploy na [Vercel](https://vercel.com/)

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as variáveis (opcional nesta fase)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

> Nesta fase, a Home roda **sem credenciais do Supabase** — os projetos usam dados
> placeholder como fallback. As variáveis passam a ser necessárias quando o
> admin/propostas/briefings entrarem.

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Resumo:

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Operações de servidor (nunca no client) |
| `NEXT_PUBLIC_SITE_URL` | OG, sitemap, links públicos |
| `RESEND_API_KEY` / `ADMIN_NOTIFICATION_EMAIL` / `EMAIL_FROM` | Notificações por e-mail |
| `NEXT_PUBLIC_WHATSAPP_URL` / `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_INSTAGRAM_URL` | Contato |

## Tipografia

A identidade pede **Amago Sans** (arquivo custom). Enquanto o `.woff2` não é
fornecido, o projeto usa **Inter** (fallback da identidade). Para trocar, coloque
os arquivos em [`/public/fonts`](public/fonts) e ajuste [`src/lib/fonts.ts`](src/lib/fonts.ts)
(há instruções no próprio arquivo).

## Banco de dados (Supabase)

1. Crie um projeto no Supabase.
2. No **SQL Editor**, rode [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. (Opcional) Rode [`supabase/seed.sql`](supabase/seed.sql) para dados de exemplo.
4. **Authentication → Providers → Email**: desative "Allow new users to sign up".
5. **Authentication → Users → Add user**: crie o login do admin.
6. Preencha as variáveis no `.env.local` (e na Vercel).

Buckets criados pela migration: `projects` (público) e `briefing-uploads` (privado).

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) (Framework: Next.js).
2. Em **Settings → Environment Variables**, adicione as variáveis do `.env.example`.
   As `NEXT_PUBLIC_*` são do tipo **Config**; `SUPABASE_SERVICE_ROLE_KEY` e
   `RESEND_API_KEY` são **Secret**.
3. Deploy. Pushes na `main` viram deploy automático.

## Status

- [x] Base do projeto + design system (temas claro/escuro, tokens da paleta)
- [x] Home (hero, sobre, trabalhos, serviços, entregáveis, processo, para quem é, CTA)
- [x] Página de projeto (`/projetos/[slug]`) + Contato
- [x] Schema Supabase + admin de projetos (upload, publicar, reordenar)
- [x] Sistema de propostas (builder, página pública, aceite, PDF, tracking)
- [x] Sistema de briefings (templates, personalização, link único, autosave, respostas)
