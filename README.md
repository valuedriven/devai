# Devia

> **Plataforma de e-commerce para microempreendedores** — Controle total de pedidos e pagamentos com uma vitrine digital profissional.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📋 Sobre o Projeto

**Devia** (anteriormente SeWAI) é uma solução completa para microempreendedores que sofrem com a falta de controle em pedidos e pagamentos. A plataforma oferece:

- **Para o Cliente**: Vitrine digital simples e profissional para realizar pedidos
- **Para o Empreendedor**: Painel de gestão completo, do pedido ao pagamento

### 🎯 Diferenciais

- ✨ **Simplicidade Radical** — Adoção imediata e zero complexidade técnica
- 🏪 **Vitrine Profissional** — Credibilidade instantânea para o catálogo de produtos
- 💰 **Controle Financeiro** — Fim da inadimplência e das perdas por esquecimento

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** 20.x ou superior
- **npm** ou **yarn**
- **Git**

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/devia.git
   cd devia
   ```

2. **Instale as dependências do frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   ```
   
   Edite `.env.local` com suas credenciais:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Clerk (Autenticação)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   
   # Resend (E-mails)
   RESEND_API_KEY=your_resend_key
   ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador

---

## 📁 Estrutura do Projeto

```
devia/
├── docs/                      # Documentação do projeto
│   ├── prd.md                # Product Requirements Document
│   ├── spec_tech.md          # Especificação Técnica
│   ├── spec_ui.md            # Especificação de UI/UX
│   ├── diagramas/            # Diagramas de arquitetura
│   └── fluxo/                # Fluxos de usuário
├── frontend/                 # Aplicação Next.js
│   ├── src/
│   │   ├── app/             # App Router (páginas)
│   │   ├── components/      # Componentes React
│   │   ├── lib/             # Utilitários e configurações
│   │   └── styles/          # Estilos globais
│   ├── public/              # Arquivos estáticos
│   └── package.json
└── README.md
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router)
- **UI**: React 19.2.3 com TypeScript
- **Estilização**: Vanilla CSS com Design System
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Utilitários**: clsx para manipulação de classes

### Integrações (Planejadas)
- **Backend**: NestJS 11+ com API RESTful
- **Banco de Dados**: PostgreSQL 15+ via Supabase
- **ORM**: Prisma 5+
- **Autenticação**: Clerk (OAuth 2.0 / OpenID Connect)
- **E-mails**: Resend
- **Deploy**: Vercel (frontend) + AWS (futuro)
- **CI/CD**: GitHub Actions
- **Observabilidade**: Grafana Cloud

---

## 📚 Funcionalidades Principais

### Para Clientes
- ✅ **Vitrine de Produtos** — Navegação e visualização de catálogo
- ✅ **Carrinho de Compras** — Seleção e gestão de itens
- ✅ **Criação de Pedidos** — Checkout simplificado
- ✅ **Histórico de Pedidos** — Acompanhamento de status

### Para Administradores
- 🔧 **Gestão de Produtos** — CRUD completo com controle de visibilidade
- 🔧 **Gestão de Categorias** — Organização do catálogo
- 🔧 **Gestão de Clientes** — Cadastro e manutenção
- 🔧 **Gestão de Pedidos** — Controle de status e pagamentos
- 📊 **Dashboard** — Métricas de vendas e desempenho

> **Legenda**: ✅ Implementado | 🔧 Em desenvolvimento | 📋 Planejado

---

## 🎨 Design System

O projeto utiliza um design system customizado baseado em CSS Variables para garantir consistência visual:

- **Cores**: Paleta harmoniosa com suporte a dark mode
- **Tipografia**: Google Fonts (Inter, Roboto, Outfit)
- **Componentes**: Biblioteca reutilizável e modular
- **Responsividade**: Mobile-first design

Consulte [`docs/spec_ui.md`](docs/spec_ui.md) para detalhes completos.

---

## 🔒 Segurança

- **Autenticação**: JWT com RS256/ES256
- **Tokens**: Access token (15min) + Refresh token (7 dias)
- **Armazenamento**: HttpOnly cookies (SameSite=strict)
- **Autorização**: Role-based access control (Admin/Cliente)
- **Auditoria**: Registro de todas as operações críticas

---

## 📖 Documentação

- **[PRD](docs/prd.md)** — Requisitos do produto e funcionalidades
- **[Especificação Técnica](docs/spec_tech.md)** — Arquitetura e stack
- **[Especificação UI/UX](docs/spec_ui.md)** — Design e experiência do usuário
- **[Fluxos](docs/fluxo/)** — Diagramas de fluxo de usuário
- **[Diagramas](docs/diagramas/)** — Arquitetura e modelos de dados

---

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar linter
npm run lint
```

---

## 🚢 Deploy

### Frontend (Vercel)

O deploy do frontend é automatizado via Vercel:

```bash
# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```

### Backend (Futuro)

O backend será containerizado e deployado via AWS EKS com Terraform.

---

## 🗺️ Roadmap

### MVP (1 mês)
- [x] Setup do projeto Next.js
- [x] Design system e componentes base
- [ ] Integração com Supabase
- [ ] Autenticação com Clerk
- [ ] Vitrine de produtos funcional
- [ ] Fluxo de pedidos básico

### Versão 1.0 (6 meses)
- [ ] Backend NestJS completo
- [ ] Multi-tenancy (schema por tenant)
- [ ] Dashboard administrativo
- [ ] Sistema de notificações
- [ ] Observabilidade completa
- [ ] Testes automatizados (E2E, integração, unidade)

### Futuro
- [ ] Upload de imagens (S3/R2)
- [ ] Gateway de pagamentos (Stripe, Pagar.me)
- [ ] Notificações WhatsApp (Twilio)
- [ ] App mobile (React Native)
- [ ] Sistema de cupons e descontos
- [ ] Importação em massa (CSV/Excel)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Siga os princípios SOLID e Clean Architecture
- Use TypeScript com tipagem estrita
- Escreva testes para novas funcionalidades
- Documente APIs com JSDoc/TSDoc
- Mantenha commits semânticos (Conventional Commits)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Equipe Devia** - *Desenvolvimento inicial*

---

## 🙏 Agradecimentos

- Comunidade Next.js
- Supabase pela infraestrutura
- Clerk pela solução de autenticação
- Todos os contribuidores do projeto

---

## 📞 Contato

- **Website**: [em breve]
- **Email**: [seu-email@exemplo.com]
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/devia/issues)

---

<div align="center">
  Feito com ❤️ para microempreendedores
</div>