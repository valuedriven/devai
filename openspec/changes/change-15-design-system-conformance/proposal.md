# 15 — Design System Conformance (Gap Closure)

## Why

A auditoria estática do frontend contra `docs/design.md` e contra a spec `design-system-alignment` confirmou que o núcleo está correto (paleta, elevação flat, pills, product card full-bleed), mas encontrou violações pontuais que o suite atual não detecta: containers usando o raio de pill (30px), CTAs principais com 56px de altura, botões crus no admin, ícones reduzidos a 32px, badges de produto com cor semântica indevida, PDP fora do sistema, `<Link><Button/></Link>` aninhado e regras de componente sem os tokens de spacing/tipografia. Sem essa correção, a paridade com o design system continua parcial e a rede de testes permanece cega a regressões visuais.

## What Changes

- **Papéis de raio**: containers (imagem de PDP, empty states, modais, toasts, ícones decorativos) passam a `0px`; `24px` fica restrito a inputs/pills de busca; `30px` a CTA, chip e badge; `full` a ícones circulares e swatches. Corrige os 12 usos indevidos de `rounded-lg`.
- **Métricas de CTA**: `.btn-lg` deixa de sobrescrever a altura de 48px do `button-primary`; botões crus de admin (`rounded-md`, `bg-red-600`/`bg-blue-600`) migram para o componente `Button`; controles de ícone não descem de 40px (fim dos overrides `h-8 w-8`).
- **Semântica de badge**: "Esgotado" e "Indisponível" passam a `badge-promo` (canvas + hairline + ink); `sale` permanece exclusivo de preço/desconto em texto.
- **PDP**: imagem em superfície flat (0 raio, `soft-cloud`, sem borda), preço em `heading-lg` (24px) e input de frete usando o componente compartilhado.
- **Composição e acessibilidade**: `<Link><Button/></Link>` substituído por `buttonVariants` aplicado ao próprio `Link` nos ~10 pontos afetados.
- **Tokens completos**: adicionar accents (`accent-pink*`, `accent-purple*`, `accent-teal`), tiers `button-md`/`button-lg`/`link-md` e fazer as regras de componente referenciarem `--space-*`/`--type-*` em vez de `rem` cru.
- **Limpeza de utilitários legados**: remover `shadow-lg`/`shadow-xl` do TSX, eliminar o `.bg-black` ambíguo (50% de opacidade) e trocar `bg-red-600`/`text-gray-500`/`border-slate-*` por classes do vocabulário do sistema.
- **Tipografia**: `.section-title` sem uppercase e na tier `heading-xl`; corrigir headings fora da escala no auth (28px) e no perfil (18px).
- **Admin**: dialogs/forms usando `Card`/`Button`/`Input`, página em canvas (não `soft-cloud`) e remoção do subsistema legado `components/admin/categories/*` com classes gray/red.
- **Testes**: os specs de alinhamento passam a assertar valores computados (radius, height, box-shadow) nos componentes-chave, em vez de apenas presença de classe.
- **BREAKING (visual apenas)**: containers que hoje exibem 30px de raio passam a ser retos; CTAs `size="lg"` encolhem de 56px para 48px.

## Capabilities

### New Capabilities

- Nenhuma.

### Modified Capabilities

- `design-system-alignment`: endurece os requisitos de papéis de raio (container vs. pill), métricas de CTA (48px, 30px, ícone ≥40px), semântica de badge, conformidade do PDP, composição `Link`/`Button`, cobertura de tokens e verificação por valores computados.

## Impact

- **CSS**: `apps/frontend/src/app/globals.css` (tokens, `.btn-lg`, `.badge-*`, `.card`, `.input`, utilitários legados, tipografia de seção).
- **Componentes**: `components/ui/{Button,Badge,Card,Input,ProductCard}.tsx`, `components/layout/{Header,Footer,DesktopSidebar,UserDropdown}.tsx`, `components/auth/{LoginForm,RegisterForm}.css`, `components/ui/toast-container.tsx`, `components/admin/*` e `components/admin/categories/*`.
- **Páginas**: `(shop)/{page,products/[id],cart,checkout,checkout/success,orders,orders/[id],profile}`, `403`, `(admin)/layout.tsx` e páginas admin de produtos/categorias/pedidos.
- **Testes**: `apps/frontend/tests/design-system-alignment.spec.ts` e `design-system-alignment-admin.spec.ts` (asserts computados), preservando `data-testid` e fluxos existentes.
- **Sem impacto** em backend, API, schema, dependências ou fontes. Navegação primária (primary-nav/utility-bar) e componentes editoriais/fotográficos permanecem fora do escopo (change futuro).
