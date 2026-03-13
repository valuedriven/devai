# AGENTS.md

Plataforma de e-commerce para microempreendedores: vitrine digital para clientes realizarem pedidos + painel administrativo para gestão de pedidos e pagamentos.

---

## Stack

### Frontend (ativo)
- Next.js 16+ com App Router
- React 19 + TypeScript 5
- Vanilla CSS com Design System (tokens semânticos — nunca valores hardcoded)
- Lucide React, clsx

### Backend (planejado)
- NestJS 11+, PostgreSQL 15+, Prisma 5+, API RESTful

### Serviços
- Auth: Clerk (JWT, HttpOnly cookies, SameSite=strict)
- DB: PostgreSQL → AWS RDS (futuro)
- Deploy: Vercel → AWS EKS (futuro)
- Notificações: Resend → AWS SES (futuro)
- CI/CD: GitHub Actions

---

## Persona do agente de Backend
- **Objetivo:** Construir aplicações escaláveis, modulares e testáveis com NestJS.
- **Lógica de decisão:** Priorize as restrições definidas em `docs/prd.md`, `docs/spec_tech.md` e `docs/spec_ui.md` sobre os padrões padrão.
- **Consciência de referência:** Verifique se uma biblioteca compartilhada existe em `libs/` antes de criar uma nova utilidade em `backend`.

## Contexto de Entrada 
- Quando uma alteração é solicitada, verifique `docs/prd.md` para garantir alinhamento com o negócio.
- Sempre faça referência cruzada `docs/spec_tech.md` e `docs/spec_ui.md` para consistência do esquema de banco de dados.

## Requisitos de saída
- Forneça testes unitários (Jest) para cada novo serviço gerado.
- Seguir a estrutura de pastas: src/modules/[module-name]/{controllers, services, dto, entities}.

---

## Documentação de Referência

- `docs/prd.md` — Requisitos e critérios de aceitação
- `docs/spec_tech.md` — Arquitetura detalhada
- `docs/spec_ui.md` — Interfaces e fluxos de navegação

## Documentação não disponível

- Não acesse o conteúdo das seguintes pastas:
  - `.fluxo`


  