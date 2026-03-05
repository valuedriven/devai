# DevAI - Gestão Simples para Microempreendedores

O **DevAI** é uma plataforma de fluxo duplo projetada para resolver a falta de controle em pedidos e pagamentos que gera prejuízos diários para o microempreendedor. A solução oferece uma vitrine digital simples para clientes e um painel de gestão completo para o empreendedor.

## 🚀 Diferenciais
- **Simplicidade Radical:** Foco em adoção imediata sem complexidade técnica.
- **Vitrine Profissional:** Credibilidade instantânea para o catálogo de produtos.
- **Controle Financeiro:** Gestão eficiente de recebíveis e pendências.

---

## 🛠️ Stack Tecnológica

### Core
- **Frontend:** [Next.js 16+](https://nextjs.org/) (App Router), TypeScript, Vanilla CSS.
- **Backend:** [NestJS 11+](https://nestjs.com/), Node 24+, TypeScript.
- **Banco de Dados:** PostgreSQL 15+.
- **ORM:** [Prisma 6+](https://www.prisma.io/).

### Serviços e Integrações
- **Autenticação:** [Clerk](https://clerk.com/) (OpenID Connect / OAuth 2.0).
- **Infraestrutura/DB:** [Supabase](https://supabase.com/).
- **Deployment:** [Vercel](https://vercel.com/).
- **IaC:** Terraform.
- **Pipeline:** GitHub Actions.
- **Observabilidade:** Grafana Cloud (OpenTelemetry).

---

## 📋 Funcionalidades Principais

### Para o Cliente
- **Vitrine de Produtos:** Visualização de catálogo organizado.
- **Gestão de Carrinho:** Seleção de itens e cálculo automático de totais.
- **Pedidos:** Criação e acompanhamento de histórico de pedidos.

### Para o Administrador
- **Dashboard:** Métricas de desempenho (Vendas totais, Recebidos vs Pendentes).
- **Gestão de Produtos/Categorias:** Cadastro completo e controle de visibilidade.
- **Gestão de Clientes:** Base de dados de clientes associada a pedidos.
- **Controle de Pedidos:** Acompanhamento de status (Novo, Pago, Preparação, etc.) e registro manual de pagamentos.

---

## 🏗️ Estrutura do Repositório

O projeto utiliza uma estrutura de monorepo:

```text
devai/
├── backend/            # API NestJS (Lógica de negócio, Repositórios, DTOs)
├── frontend/           # Aplicação Next.js (Vitrine, Admin e Auth)
│   ├── src/app/
│   │   ├── (admin)/    # Rotas de gestão administrativa
│   │   ├── (auth)/     # Fluxos de login e cadastro
│   │   └── (shop)/     # Vitrine e experiência do cliente
│   └── components/     # Componentes React (Admin, Shop, UI)
├── docs/               # Documentação técnica e de produto (PRD, Spec)
├── terraform/          # Definições de Infraestrutura como Código
└── package.json        # Configuração de workspaces do monorepo
```

---

## 🚦 Começando

### Pré-requisitos
- Node.js 24+
- Docker & Docker Compose
- Conta no Clerk e Supabase (para variáveis de ambiente)

### Instalação
1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd devai
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente baseadas no arquivo `.env.example` no diretório raiz.

### Desenvolvimento Local
Para rodar ambos os serviços simultaneamente:
```bash
npm install
npm run dev:backend

Abra outro terminal e execute:
npm run dev:frontend
```

---

## 📄 Documentação Adicional
- [Product Requirements Document (PRD)](./docs/prd.md)
- [Especificação Técnica](./docs/spec_tech.md)
- [Especificação de UI](./docs/spec_ui.md)