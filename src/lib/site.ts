/**
 * Conteúdo e identidade do Âmago Studio.
 * Centralizado para reaproveitar/trocar copy sem caçar por strings soltas.
 */

export const site = {
  name: "Âmago Studio",
  tagline: "Design que vai direto ao ponto.",
  shortDescription:
    "Âmago é um studio de design focado em negócios digitais. Criamos landing pages, identidades visuais e lançamentos com clareza e intenção — do conceito à entrega.",
  about:
    "Somos um studio pequeno e afiado. Trabalhamos com poucos projetos por vez para entregar design com profundidade — não volume. Cada peça nasce de uma pergunta simples: qual é o âmago disso?",
  idealClient:
    "Para negócios digitais que já sabem o que fazem, mas precisam de uma marca e de páginas que comuniquem isso com a mesma clareza. Fundadores, infoprodutores e times enxutos que valorizam intenção acima de enfeite.",
  contact: {
    whatsapp:
      process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/5500000000000",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contato@amagostudio.com.br",
    instagram:
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/amago.studio",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

export const services = [
  {
    title: "Landing pages",
    description:
      "Páginas de conversão pensadas do argumento ao pixel. Estrutura, copy-guia e visual que levam à ação.",
  },
  {
    title: "Identidade visual",
    description:
      "Marca com sistema: logo, tipografia, cores e aplicações prontas para escalar com consistência.",
  },
  {
    title: "Lançamento completo",
    description:
      "Do posicionamento à entrega: identidade, páginas e materiais alinhados para um lançamento coeso.",
  },
];

export type Deliverable = {
  code: string;
  title: string;
  line: string;
  includes: string[];
};

export const deliverables: Deliverable[] = [
  {
    code: "/01",
    title: "Landing page",
    line: "Uma página, um objetivo, zero ruído.",
    includes: [
      "Arquitetura de conteúdo e copy-guia",
      "Design responsivo (mobile-first)",
      "Entrega em página única pronta para publicar",
    ],
  },
  {
    code: "/02",
    title: "Identidade visual",
    line: "Um sistema de marca que se sustenta sozinho.",
    includes: [
      "Logo e variações",
      "Tipografia, paleta e grid",
      "Manual de aplicações essenciais",
    ],
  },
  {
    code: "/03",
    title: "Lançamento completo",
    line: "Marca e páginas falando a mesma língua.",
    includes: [
      "Posicionamento e direção visual",
      "Identidade + landing pages",
      "Kit de materiais para divulgação",
    ],
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Briefing",
    description: "Entendemos o negócio, o objetivo e o que não pode faltar.",
  },
  {
    step: "02",
    title: "Kickoff",
    description: "Alinhamos escopo, prazos e direção antes de desenhar.",
  },
  {
    step: "03",
    title: "Criação",
    description: "Design em rodadas objetivas, com poucos e certeiros ajustes.",
  },
  {
    step: "04",
    title: "Entrega",
    description: "Arquivos organizados, prontos para uso e para escalar.",
  },
];

/** Tipos de entrega usados em selects do admin, templates e propostas. */
export const PROJECT_TYPES = [
  "Landing page",
  "Identidade visual",
  "Lançamento completo",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/** Projetos placeholder — usados quando o Supabase ainda não está configurado. */
export type PlaceholderProject = {
  slug: string;
  title: string;
  type: ProjectType;
  client: string;
  year: string;
  summary: string;
  cover_url: string;
};

export const placeholderProjects: PlaceholderProject[] = [
  {
    slug: "nova-financas",
    title: "Nova Finanças",
    type: "Landing page",
    client: "Nova",
    year: "2025",
    summary:
      "Landing de captação para uma fintech de investimentos. Foco em confiança e clareza de proposta.",
    cover_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "raiz-cafe",
    title: "Raíz Café",
    type: "Identidade visual",
    client: "Raíz",
    year: "2024",
    summary:
      "Identidade completa para uma torrefação artesanal — do símbolo às embalagens.",
    cover_url:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "orbita-lancamento",
    title: "Órbita — Lançamento",
    type: "Lançamento completo",
    client: "Órbita",
    year: "2025",
    summary:
      "Lançamento de um curso online: posicionamento, identidade e páginas de venda.",
    cover_url:
      "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "verten-studio",
    title: "Vertèn",
    type: "Identidade visual",
    client: "Vertèn",
    year: "2024",
    summary:
      "Marca minimalista para um studio de arquitetura de interiores.",
    cover_url:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },
];
