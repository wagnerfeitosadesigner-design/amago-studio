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

## Status

- [x] Base do projeto + design system (temas claro/escuro, tokens da paleta)
- [x] Home (hero, sobre, trabalhos, serviços, entregáveis, processo, para quem é, CTA)
- [ ] Página de projeto (`/projetos/[slug]`) + Contato
- [ ] Schema Supabase + admin de projetos
- [ ] Sistema de propostas
- [ ] Sistema de briefings
