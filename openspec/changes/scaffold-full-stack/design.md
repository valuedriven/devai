## Context

O projeto requer uma estrutura de monorepo robusta para acoplar o frontend (Next.js) e o backend (NestJS). O uso de npm workspaces permite centralizar dependências na raiz, facilitando scripts de desenvolvimento e builds integradas.

## Goals / Non-Goals

**Goals:**
- Configurar os workspaces do npm para apontar para `apps/frontend` e `apps/backend`.
- Adicionar scripts na raiz para iniciar servidores de desenvolvimento e realizar builds.
- Garantir que as configurações TypeScript e ESLint nos subprojetos estejam alinhadas.
- Definir os tokens globais do Design System em `globals.css` no frontend.

**Non-Goals:**
- Configurações de deploy (Vercel) ou infraestrutura docker (estas possuem changes dedicadas).
- Implementação de endpoints funcionais de negócio no backend ou telas funcionais no frontend.

## Decisions

- **Utilização de npm Workspaces**: Adotado para consistência com o arquivo `package-lock.json` existente na raiz, evitando misturar gerenciadores de pacotes diferentes (como pnpm/yarn).
- **CSS Vanilla Puro para Design System**: Os tokens de design descritos no `design_system.md` serão declarados em `:root` no globals.css do Next.js sem usar pré-processadores ou utilitários complexos para simplificar a manutenção.

## Risks / Trade-offs

- **Conflitos de versão de dependências**: Dependências duplicadas ou conflitantes nos projetos internos podem gerar problemas na instalação.
  - *Mitigação*: Definir explicitamente versões compatíveis no root package.json e delegar o gerenciamento ao npm workspaces.
