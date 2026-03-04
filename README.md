# DevAI

> **Plataforma de e-commerce para microempreendedores** — Controle total de pedidos e pagamentos com uma vitrine digital profissional.

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-red?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk)](https://clerk.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Sobre o Projeto

**DevAI** é uma solução completa para microempreendedores que buscam profissionalizar sua presença digital e simplificar a gestão de pedidos. Focada na facilidade de uso e eficiência, a plataforma permite que negócios locais cresçam com organização e credibilidade.

### ✨ Funcionalidades em Destaque

- 🏪 **Vitrine Digital**: Catálogo online intuitivo e otimizado para conversão.
- 📦 **Gestão de Catálogo**: Controle total de produtos e categorias via painel administrativo.
- 🏢 **Multi-tenancy**: Isolamento de dados robusto entre diferentes lojistas.
- 💰 **Controle de Pedidos**: Acompanhamento em tempo real, do carrinho à entrega.
- 🔒 **Segurança Nativa**: Autenticação moderna e controle de acesso granular.

---

## 🛠️ Stack Tecnológica

O projeto é estruturado como um **Monorepo** utilizando npm workspaces, garantindo consistência e facilidade no compartilhamento de tipos e configurações.

### Frontend (`/frontend`)
- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router)
- **UI**: [React 19](https://react.dev/) com TypeScript
- **Estilização**: Vanilla CSS com Design System (Tokens de cores, tipografia e espaçamento)
- **Componentes**: Biblioteca customizada e modular
- **Autenticação**: [Clerk](https://clerk.com/)

### Backend (`/backend`)
- **Framework**: [NestJS 11+](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Arquitetura**: Modular com foco em isolamento de domínios e multi-tenancy nativo
- **Testes**: Jest (Unitários, Integração e E2E)

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** 10.x ou superior
- **Docker** (opcional, para DB local)

### Instalação e Configuração

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/devai.git
   cd devai
   ```

2. **Instale as dependências (Monorepo)**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**

   **No Backend (`/backend/.env`):**
   ```env
   DATABASE_URL="postgresql://user:pass@host:port/db?schema=public"
   # Adicione outras variáveis necessárias para Clerk/Supabase
   ```

   **No Frontend (`/frontend/.env.local`):**
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret
   ```

4. **Prepare o Banco de Dados**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push # ou migrate dev
   ```

### Execução em Desenvolvimento

Você pode rodar ambos os serviços a partir da raiz do projeto:

```bash
# Rodar Frontend
npm run dev:frontend

# Rodar Backend
npm run dev:backend
```

---

## 📁 Estrutura do Projeto

```
devai/
├── backend/               # API NestJS
│   ├── src/
│   │   ├── core/         # Interceptors, Decorators, Guards Globais
│   │   ├── database/     # Configuração Prisma e Database Service
│   │   └── modules/      # Módulos de Domínio (Catalog, etc.)
│   └── test/             # Testes E2E
├── frontend/              # App Next.js
│   ├── src/
│   │   ├── app/          # App Router (shop, admin, auth)
│   │   ├── components/   # Componentes Shared/UI
│   │   └── lib/          # Client API e Utilities
├── docs/                  # Documentação de Arquitetura e Requisitos
├── package.json           # Configuração de Monorepo (Workspaces)
└── README.md
```

---

## 🔒 Multi-tenancy

O sistema utiliza uma abordagem de **Isolamento via Identificador (`tenantId`)** em nível de registro. No backend, isso é gerenciado automaticamente por meio de decoradores e interceptores que extraem o contexto do lojista a partir de headers de requisição ou tokens JWT.

Consulte [`docs/spec_tech.md`](docs/spec_tech.md) para detalhes da implementação.

---

## 🧪 Qualidade de Código

Para manter a consistência e confiabilidade:

```bash
# Rodar todos os testes do backend
cd backend
npm test

# Cobertura de testes
npm run test:cov

# Linter
npm run lint
```

---

## 🚢 Roadmap

- [x] Inicialização do Monorepo
- [x] Estrutura Base de Multi-tenancy
- [x] Módulo de Catálogo (Produtos e Categorias) no Backend
- [x] Integração Inicial Frontend-Backend
- [ ] Implementação de Carrinho e Pedidos
- [ ] Dashboards Administrativos Avançados
- [ ] Notificações via WhatsApp/E-mail
- [ ] Deploy Automatizado em Produção (AWS/Vercel)

---

## 🤝 Contribuindo

Siga os padrões de **SOLID** e **Clean Architecture**. Commits devem seguir a especificação [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Feito com ❤️ para microempreendedores
</div>