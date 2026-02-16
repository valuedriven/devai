# AGENTS.md

> **Contexto do Projeto Devia para Agentes de IA**  
> Este documento fornece informações essenciais para agentes de IA que trabalharão no desenvolvimento, manutenção e evolução do projeto.

---

## 📋 Visão Geral do Produto

**Devia** é uma plataforma de e-commerce para microempreendedores que resolve o problema de falta de controle em pedidos e pagamentos.

### Problema
A falta de controle em pedidos e pagamentos gera prejuízos diários para o microempreendedor.

### Solução
Plataforma de fluxo duplo:
- **Para o Cliente**: Vitrine digital simples para realizar pedidos
- **Para o Empreendedor**: Painel de gestão completo, do pedido ao pagamento

### Diferenciais
- **Simplicidade Radical**: Adoção imediata e zero complexidade técnica
- **Vitrine Profissional**: Credibilidade instantânea para o catálogo de produtos
- **Controle Financeiro**: Fim da inadimplência e das perdas por esquecimento

---

## 👥 Perfis de Usuário

### Administrador
- **Problemas**: Perdas de vendas e sobrecarga por processo manual
- **Objetivos**: Gestão de vendas (pedidos e pagamentos) e manutenção de dados (produtos e clientes)
- **Faixa etária**: 18-60 anos
- **Motivações**: Possibilitar ao cliente uma experiência única
- **Frustrações**: Falta de tempo para dedicar aos produtos

### Cliente
- **Problemas**: Dificuldade em pesquisar produtos
- **Objetivos**: Realizar pedidos de maneira simples e transparente
- **Faixa etária**: 18-60 anos
- **Motivações**: Ter informações para tomar boas decisões de compra
- **Frustrações**: Excesso de informalidade no atendimento

### Autenticação e Acesso
- Cliente pode navegar na vitrine e preencher carrinho **sem autenticação**
- Cliente precisa estar **logado para concluir pedido**
- Administrador deve estar **logado para todas as ações**

---

## 🎯 Funcionalidades Principais

### RFN-01: Vitrine de Produtos
- Visualização de produtos em catálogo digital
- Exibe: nome, descrição, preço e imagem
- **Critérios**: Produtos inativos não aparecem; produtos sem estoque aparecem desabilitados

### RFN-02: Criação e Acompanhamento de Pedidos
- Cliente cria pedidos, visualiza histórico e pode cancelar pedidos não pagos
- Cálculo automático do valor total
- **Critérios**: Recalcular total ao alterar quantidade; mínimo de 1 produto para confirmar

### RFN-03: Gestão de Categorias
- CRUD de categorias (apenas administrador)

### RFN-04: Gestão de Produtos
- CRUD de produtos com controle de visibilidade (apenas administrador)
- **Critérios**: Produtos inativos não aparecem na vitrine

### RFN-05: Gestão de Clientes
- CRUD de clientes (apenas administrador)
- **Critérios**: Clientes com pedidos não são excluídos, apenas desativados

### RFN-06: Gestão de Pedidos
- Visualização por status, movimentação entre estados
- Registro manual de pagamentos pelo administrador
- **Critérios**: Filtro por status; mudanças refletidas imediatamente

### RFN-07: Dashboard
- Métricas: vendas totais, valores recebidos/pendentes
- Filtros por período

---

## 🏗️ Arquitetura e Stack Tecnológica

### Arquitetura de Referência
- **Estilo**: Aplicação web com backend desacoplado via APIs RESTful
- **Componentes**: Frontend Web, Backend de Aplicação, Banco de Dados
- **Comunicação**: HTTP/HTTPS com payloads JSON
- **Infraestrutura**: Contêineres no padrão OCI

### Stack Base

#### Frontend (Atual)
- **Framework**: Next.js 16+ (App Router)
- **UI**: React 19.2.3 com TypeScript 5.x
- **Estilização**: Vanilla CSS com Design System
- **Ícones**: Lucide React
- **Utilitários**: clsx

#### Backend (Planejado)
- **Framework**: NestJS 11+
- **API**: RESTful
- **Persistência**: PostgreSQL 15+
- **ORM**: Prisma 5+

### Integrações

#### Atuais
- **Pipeline CI/CD**: GitHub Actions
- **Persistência**: Supabase
- **Deploy**: Vercel
- **Autenticação**: Clerk (OAuth 2.0 / OpenID Connect)
- **Notificações**: Resend
- **Observabilidade**: Grafana Cloud

#### Futuras
- **Persistência**: AWS RDS PostgreSQL
- **Deploy**: AWS EKS (Kubernetes) com Terraform
- **Autenticação**: AWS Cognito
- **Mensagens**: AWS SQS
- **Notificações**: AWS SES
- **Observabilidade**: AWS CloudWatch

---

## 🔒 Segurança

### Autenticação
- **Mecanismo**: JWT Authentication
- **Algoritmo**: RS256 ou ES256
- **Access Token**: 15 minutos
- **Refresh Token**: 7 dias (rotação a cada uso)
- **Armazenamento**: HttpOnly cookies (SameSite=strict)
- **Validação**: Assinatura, exp, iss, aud

### Autorização
- Role-based access control (Admin/Cliente)
- Processo via frontend com validação no backend (middleware/guards)

### Auditoria
- Todas as tabelas têm `created_at` e `updated_at`
- Registro de eventos de atualização (usuário, objeto, ação, data/hora)

---

## 🎨 Design System e UI/UX

### Princípios de Design
- **Simplicidade**: Interface intuitiva e sem complexidade técnica
- **Consistência**: Uso de tokens semânticos do Design System
- **Acessibilidade**: Navegação por teclado, estados de loading/vazio
- **Responsividade**: Mobile-first design

### Componentes Base
Localizados em [`frontend/src/components/`](frontend/src/components/):
- **ui/**: Componentes reutilizáveis (Badge, Button, Card, etc.)
- **layout/**: Header, Sidebar, Footer
- **admin/**: Componentes específicos do painel administrativo

### Status de Pedidos (Badges)

| Status     | Contexto    | Badge Tone | Semântica                          |
| ---------- | ----------- | ---------- | ---------------------------------- |
| Novo       | Operacional | neutral    | Pedido criado, sem ação financeira |
| Pago       | Financeiro  | success    | Pagamento confirmado               |
| Preparação | Operacional | info       | Pedido em preparação               |
| Faturado   | Financeiro  | info       | Pedido faturado                    |
| Despachado | Operacional | info       | Pedido enviado                     |
| Entregue   | Operacional | success    | Pedido concluído                   |
| Cancelado  | Operacional | error      | Pedido cancelado                   |

### Regras de Transição de Status
- `Novo` → `Cancelado` (permitido)
- `Novo` → `Pago` → `Preparação` → `Faturado` → `Despachado` → `Entregue` (sequencial)
- Qualquer estado (exceto `Entregue` e `Cancelado`) → `Cancelado` (permitido)

---

## 📁 Estrutura do Frontend

```
frontend/
├── src/
│   ├── app/                    # App Router (Next.js)
│   │   ├── (admin)/           # Rotas administrativas
│   │   │   ├── categories/    # Gestão de categorias
│   │   │   ├── customers/     # Gestão de clientes
│   │   │   ├── dashboard/     # Dashboard administrativo
│   │   │   ├── orders/        # Gestão de pedidos
│   │   │   └── products/      # Gestão de produtos
│   │   ├── (auth)/            # Rotas de autenticação
│   │   │   └── login/         # Página de login
│   │   ├── (shop)/            # Rotas da loja
│   │   │   ├── cart/          # Carrinho de compras
│   │   │   └── orders/        # Pedidos do cliente
│   │   ├── globals.css        # Estilos globais e Design System
│   │   └── layout.tsx         # Layout raiz
│   ├── components/            # Componentes React
│   │   ├── admin/            # Componentes administrativos
│   │   ├── layout/           # Header, Sidebar, Footer
│   │   └── ui/               # Componentes UI reutilizáveis
│   └── lib/                  # Utilitários e configurações
│       ├── mock-data.ts      # Dados mockados (desenvolvimento)
│       └── utils.ts          # Funções auxiliares
├── public/                   # Arquivos estáticos
└── package.json
```

---

## 🎯 Interfaces Principais

### INT-01: Página Principal
- Barra superior: Logo, Busca, Carrinho, Perfil/Login
- Menu lateral: Dashboard, Produtos, Clientes, Pedidos (admin)
- Vitrine: Grid de cards com produtos
- Rodapé

### INT-02: Login
- Formulário: E-mail, Senha
- Link: Criar conta (perfil Cliente)

### INT-03: Carrinho de Compras
- Lista de produtos: imagem, nome, quantidade, subtotal
- Valor total calculado automaticamente
- Botão: Confirmar Pedido (cria pedido com status "Novo")

### INT-04: Acompanhamento de Pedidos
- Lista histórica: Número, Data, Total, Status (badge)
- Link: Detalhe do Pedido

### INT-05: Detalhe do Pedido
- Número, Status, lista de produtos
- Cliente: apenas visualiza
- Admin: pode alterar status

### INT-06-08: Gestão de Categorias e Produtos
- Listagem com CRUD completo
- Campos: Nome, Imagem, Descrição, Preço, Estoque, Categoria, Ativo

### INT-09-10: Gestão de Clientes
- Listagem com CRUD completo
- Campos: Nome, Endereço, E-mail, Telefone

### INT-11: Gestão de Pedidos (Admin)
- Lista: ID, Data, Total, Status (badge)
- Link: Detalhe do Pedido

### INT-12: Dashboard
- KPIs: Total de Vendas, Valor Recebido, Valor Pendente
- Lista dos últimos 5 pedidos
- Links: Produtos, Clientes, Pedidos

---

## 📐 Entidades e Domínios

### Entidades Principais
- **Categoria**: Nome, Ativo
- **Produto**: Nome, Categoria, Imagem, Descrição, Estoque, Ativo
- **Cliente**: Nome, Endereço, E-mail, Telefone, Ativo
- **Pedido**: Número, Valor Total, Cliente, Endereço, Status, Data de Pagamento, Método de Pagamento
- **Item de Pedido**: Pedido, Produto, Preço Unitário, Quantidade

### Domínios
- **Status do Pedido**: Novo, Pago, Preparação, Faturado, Despachado, Entregue, Cancelado
- **Métodos de Pagamento**: Cartão de Crédito, Cartão de Débito, Pix, Dinheiro

---

## 🔧 APIs (Planejadas)

### Padrões
- **Endpoint principal**: `https://api.dominio.com/v1/`
- **Versionamento**: URI path (`/v1/products`)
- **Nomenclatura**: `/v1/{resource}/{id}`
- **Autenticação**: Bearer JWT no header `Authorization`
- **Rate limiting**: 100 req/min por IP, 1000 req/min por usuário autenticado
- **CORS**: Whitelist de domínios do tenant

### Endpoints
- **Públicos**: Vitrine, produtos ativos
- **Protegidos**: Pedidos, gestão, dashboard

---

## 🏢 Multi-Tenancy (Futuro)

### Estratégia
- Banco de dados compartilhado com **schema separado por tenant**
- Cada tenant possui schema próprio (ex: `tenant_abc123`)
- Identificação via subdomain (`tenant.dominio.com`) ou header `X-Tenant-ID`
- Row Level Security (RLS) habilitado em todas as tabelas

### MVP
- Mono-tenant com evolução planejada
- Schema único, `tenant_id` como preparação

---

## 🧪 Diretrizes de Desenvolvimento

### Padrões de Código
- Seguir princípios **SOLID** e **Clean Architecture**
- NestJS: controllers, services, repositories, DTOs
- Utilizar interceptors para tenant resolution e logging
- Implementar guards para autorização baseada em roles
- Utilizar transactions para operações multi-tabela
- Documentar APIs com Swagger/OpenAPI

### Frontend
- Componentes reutilizáveis e modulares
- Utilizar tokens semânticos do Design System (não hardcoded)
- Implementar estados de loading e vazio em listagens
- Validar campos de formulário em tempo real
- Confirmar ações destrutivas antes de executar
- Garantir navegação por teclado (acessibilidade)

### Testes
- Testes automatizados: unidade, integração, aceite
- Frameworks do mercado (Jest, React Testing Library, Cypress)
- Facilitar manutenção e detecção precoce de falhas

---

## 📚 Documentação de Referência

- **[PRD](docs/prd.md)**: Requisitos do produto completos
- **[Especificação Técnica](docs/spec_tech.md)**: Arquitetura e stack detalhada
- **[Especificação UI/UX](docs/spec_ui.md)**: Interfaces e fluxos de navegação
- **[README](README.md)**: Visão geral e instruções de setup

---

## 🗺️ Escopo e Roadmap

### MVP (1 mês)
- Setup Next.js com Design System
- Vitrine de produtos funcional
- Fluxo de pedidos básico
- Autenticação com Clerk
- Integração com Supabase

### Versão 1.0 (6 meses)
- Backend NestJS completo
- Multi-tenancy (schema por tenant)
- Dashboard administrativo
- Sistema de notificações
- Observabilidade completa (RNF-04)
- Testes automatizados (RNF-05)
- Deploy automatizado (RNF-06)

### Fora de Escopo (v1.0)
- Conversas/chat com clientes
- Divisão de pagamento
- Controle avançado de estoque
- CRM avançado
- Integração automática com gateways de pagamento

### Futuro
- Upload de imagens (S3/R2)
- Gateway de pagamentos (Stripe, Pagar.me)
- Notificações WhatsApp (Twilio)
- App mobile (React Native/Flutter)
- Sistema de cupons e descontos
- Importação em massa (CSV/Excel)
- Relatórios avançados (PDF/Excel)

---

## 🎯 Métricas de Sucesso

- Aumentar em **20%** o Total recebido (R$) em 12 meses
- Reduzir em **10%** o Total pendente (R$) em 12 meses

---

## ⚠️ Considerações Importantes

### Premissas
- Prazo MVP: 1 mês
- Prazo v1.0: 6 meses
- Stack tecnológica definida neste documento

### Restrições
- MVP opera com **único tenant ativo**
- Pagamento **manual** (não integrado com gateway)
- Imagens via **URL** (sem upload no MVP)
- RNF-04, RNF-05, RNF-06 fora do MVP (arquitetura preparada)

---

## 🤖 Instruções para Agentes de IA

Ao trabalhar neste projeto:

1. **Respeite a arquitetura**: Siga os padrões definidos em [`docs/spec_tech.md`](docs/spec_tech.md)
2. **Mantenha consistência**: Use o Design System e tokens semânticos
3. **Priorize simplicidade**: O produto é voltado para microempreendedores sem conhecimento técnico
4. **Valide requisitos**: Consulte [`docs/prd.md`](docs/prd.md) para critérios de aceitação
5. **Siga padrões UI**: Consulte [`docs/spec_ui.md`](docs/spec_ui.md) para interfaces e fluxos
6. **Documente mudanças**: Mantenha código legível e bem documentado
7. **Pense em evolução**: Prepare código para multi-tenancy e escalabilidade futura
8. **Teste adequadamente**: Implemente testes para novas funcionalidades
9. **Considere acessibilidade**: Navegação por teclado, estados de loading, validações
10. **Proteja rotas**: Garanta autenticação/autorização adequada

---

<div align="center">
  <strong>Este documento é mantido como fonte única de verdade para agentes de IA</strong><br>
  Última atualização: 2026-02-16
</div>
