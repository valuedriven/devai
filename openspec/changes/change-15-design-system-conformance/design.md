# Design — Design System Conformance (Gap Closure)

## Context

A auditoria estática de `apps/frontend` contra `docs/design.md` e contra a spec `design-system-alignment` confirmou que a base está correta: os tokens de cor batem exatamente com o front matter, a elevação é flat (sombras neutralizadas, sem blur), os CTAs são pills de 30px/48px, o product card é 0px/full-bleed/soft-cloud, o hero usa Bebas Neue com line-height 0.9 e o ritmo de 48px/8px está aplicado.

Restaram violações localizadas, que o suite atual não enxerga porque os specs de alinhamento só verificam presença de classe:

- `rounded-lg` resolve para `var(--radius-lg)` (30px) e foi aplicado a containers: frame do PDP, empty state, modais, toasts e ícones decorativos do perfil.
- `.btn-lg` sobrescreve a altura para `3.5rem` (56px) em cinco CTAs principais.
- O admin mantém um subsistema legado (`components/admin/categories/*`, filtros com `<button>` cru) com botões de 24px e utilitários gray/red.
- Badges de disponibilidade usam `tone="error"` (sale-deep), enquanto `.badge-promo` existe e não é usado.
- PDP usa `rounded-lg` + `border` + `bg-muted/20`, preço em `heading-xl` e input de frete avulso.
- `<Link><Button/></Link>` aparece em ~10 pontos (HTML inválido, foco duplicado).
- Vários componentes usam `rem` cru em vez de `--space-*`/`--type-*`, e faltam os tokens de accent e das tiers `button-md`/`button-lg`/`link-md`.

Restrições: Next.js é apenas camada de apresentação; nada de backend/API/schema; `data-testid` e fluxos existentes devem permanecer; sem novas dependências, fontes ou imagens.

## Goals / Non-Goals

**Goals:**

- Fechar as violações P1 e o drift de tokens P2 identificados na auditoria.
- Tornar o vocabulário de raio inequívoco por papel (container / input / CTA / ícone).
- Garantir que admin e storefront usem os mesmos componentes, não apenas os mesmos hex.
- Completar o token set do design.md e fazer as regras de componente consumirem tokens.
- Endurecer os specs de alinhamento com valores computados para impedir regressão.
- Corrigir a composição `Link`/`Button` (a11y e semântica).

**Non-Goals:**

- Fotografia/campaign tiles, `category-icon-card`, `member-benefit-card`, `faq-row`, `pdp-disclosure-row`, `filter-sidebar`, `swatch-dot`, rail de thumbnails.
- Preço promocional (sale + riscado + % off) — o modelo de produto não possui preço de comparação; fica para quando houver dado.
- Reestruturação da navegação (primary-nav + utility-bar); a IA atual usa `DesktopSidebar`.
- Tema escuro, novas fontes, novas dependências, mudanças de backend.
- Micro-interações além do que o design.md documenta (Default e Active/Pressed).

## Decisions

### D1 — Raio por papel, não por escala cega

Substituir os usos de `rounded-lg` em containers por `rounded-none` (ou remover a classe, já que o default de `.card`/frames é 0). Manter `--radius-lg` (30px) exclusivamente em `.btn*`, `.chip*` e `.badge*`; `--radius-md` (24px) em `.input`/`.search-pill`; `--radius-full` em `.btn-icon-circular` e swatches; `--radius-sm` (18px) reservado a containers de avatar/ícone.

Pontos a corrigir: `products/[id]/page.tsx:34`, `(shop)/page.tsx:66`, `profile/page.tsx:69,81`, `CategoryManager.tsx:108`, `DeleteConfirmDialog.tsx:38`, `categories/category-form.tsx:52`, `categories/delete-confirm-dialog.tsx:26`, `PaymentRegistrationModal.tsx:56`, `toast-container.tsx:43`, `(admin)/admin/orders/page.tsx:80`.

*Alternativas consideradas:* (a) redefinir `--radius-lg` para 0 e criar `--radius-pill` — rejeitado: quebra a nomenclatura do design.md e atinge CTAs silenciosamente; (b) deixar como está e só documentar — rejeitado: é exatamente o tipo de drift que a auditoria encontrou.

### D2 — `btn-lg` deixa de ser altura

Redefinir `.btn-lg` para manter `height: var(--space-section)` (48px) e aumentar apenas padding horizontal e tamanho de fonte dentro da escala. Assim `size="lg"` continua sendo uma escolha de ênfase sem violar a métrica de CTA.

*Alternativas consideradas:* (a) remover `size="lg"` e atualizar as 5 chamadas — mais invasivo e sem ganho visual; (b) permitir 56px como "exceção de destaque" — rejeitado: a spec fixa 48px.

### D3 — Ícones nunca abaixo de 40px

Remover os overrides `h-8 w-8` dos botões `size="icon"` no carrinho e nas tabelas admin. O componente já entrega 40px (`2.5rem`); overrides de consumidor passam a ser proibidos por convenção e cobertos por assert computado. O alvo de toque de 44px é obtido pelo padding do container quando necessário, sem encolher o círculo.

### D4 — Badge de disponibilidade é promo, não error

Adicionar o tom `promo` ao `Badge` (ou usar `.badge-promo` diretamente) e aplicá-lo a "Esgotado"/"Indisponível". O tom `error` continua existindo para mensagens de erro de formulário, mas não para estado de catálogo. Isso mantém `sale` restrito a preço.

*Alternativas consideradas:* (a) manter `error` e trocar apenas as cores — rejeitado: continua semanticamente errado e reincidente; (b) remover o tom `error` — rejeitado: erros de checkout/login ainda precisam de sinal textual.

### D5 — PDP flat e com componentes compartilhados

O frame da imagem passa a `rounded-none`, `background: var(--color-soft-cloud)`, sem `border` e sem sombra. O preço desce de `heading-xl` para `heading-lg`. O cálculo de frete troca o `<input>` inline por `Input` + `Button`, mantendo o `data-testid` existente se houver e o comportamento atual.

### D6 — Link que parece botão é um link estilizado

Substituir `<Link><Button/></Link>` por `<Link className={buttonVariants({...})}>` em carrinho, checkout, sucesso, pedidos, detalhe de pedido, sidebar e formulários admin. `<Button type="submit">` permanece dentro de `<form>`. Isso resolve HTML inválido, remove um tab stop e preserva métricas visuais.

*Alternativas consideradas:* (a) `Button asChild` com Radix Slot — exigiria dependência nova e o projeto não usa Slot; (b) manter o aninhamento — rejeitado por acessibilidade.

### D7 — Completar tokens e migrar regras para a escala

Adicionar ao `:root` os seis accents e as tiers `button-md`, `button-lg`, `link-md` (fiéis ao front matter). Migrar as regras de componente de `rem` cru para `--space-*`/`--type-*` onde a escala cobre o valor; exceções documentadas: 1px de hairline, offsets de focus ring e o halo de 12px. Remover `.bg-black` (que hoje resolve para ink a 50%) e substituir os utilitários legados (`bg-red-600`, `bg-blue-600`, `text-gray-*`, `border-slate-*`) por classes do vocabulário nos TSX; os aliases remanescentes ficam apenas como ponte temporária.

### D8 — Admin em um único sistema

Migrar `components/admin/categories/delete-confirm-dialog.tsx` e `category-form.tsx` para `Card` + `Button` + `Input`, alinhando raio (0 no container, 30 no CTA), superfícies e tipografia. O `(admin)/layout.tsx` passa de `bg-slate-50` para canvas. O header admin de 64px com hairline permanece. A cópia em inglês dos dialogs legados é substituída por pt-BR, consistente com o restante da aplicação.

*Alternativas consideradas:* (a) manter os dois dialogs e só trocar classes — rejeitado: duplicação gera drift de novo; (b) unificar tudo em um único `ConfirmDialog` — desejável, mas pode ser feito depois sem bloquear esta change; a tarefa prevê consolidar se o esforço for baixo.

### D9 — Testes por valor computado

Os specs de alinhamento passam a usar `toHaveCSS`/`evaluate` para os seis pontos de identidade (product card, CTA primário, chip ativo, search pill, ícone do header, badge promo) e para containers (PDP/dialog). Mantém-se a regra de escopo `:visible` por causa do payload de streaming do `<Suspense>`. Nenhum `data-testid` é renomeado.

*Alternativas consideradas:* (a) testes de snapshot visual — rejeitado: mais frágeis e sem infraestrutura de baseline no projeto; (b) manter apenas classes — rejeitado: foi o que deixou as violações passarem.

## Risks / Trade-offs

- **Mudança visual em containers (30px → 0px)** → revisar PDP, modais, toasts e profile em 1440/1024/390; a alteração é restrita a classes e reversível.
- **CTAs de 56px → 48px** → pode apertar o layout do carrinho/checkout; validar com screenshots e, se necessário, ajustar apenas o padding horizontal.
- **Asserts computados podem ser sensíveis a fonte/viewport** → limitar a radius/height/box-shadow/background (valores fixos de token), evitar posição e tamanho de texto.
- **Suite E2E pré-existente** → nenhuma mudança de `data-testid` ou de estrutura de fluxo; rodar a suíte completa com `--workers=1`.
- **Consolidação de dialogs admin** → se `CategoryManager` e `categories/*` divergirem em comportamento, migrar visual primeiro e unificar depois, para não misturar refactor funcional com estilo.
- **Aliases legados restantes** → o grep de `bg-red-600`/`text-gray-500`/`shadow-*` no TSX vira tarefa de aceite; aliases sem consumidores podem ser removidos em follow-up.

## Migration Plan

1. Tokens e utilitários no `globals.css` (accents, tiers, `.btn-lg`, `.badge-promo`, remoção de `.bg-black`, regras com `--space-*`).
2. Componentes compartilhados (`Badge` com tom promo; `Button`/`Card`/`Input` sem mudanças de API).
3. Containers com raio indevido (PDP, empty state, modais, toasts, perfil).
4. CTAs e ícones (remover `size="lg"` height override e overrides `h-8 w-8`).
5. Composição `Link`/`Button` nos 10 pontos.
6. PDP e badges de catálogo.
7. Admin: layout, dialogs, formulários e filtros.
8. Tipografia (section title, auth, perfil) e limpeza de utilitários legados.
9. Testes computados + `npm run lint --workspace=frontend`, `npm run build --workspace=frontend`, specs de alinhamento e suíte E2E com `--workers=1`.
10. Rollback: reverter o diff (CSS/classes apenas); sem migração de dados.

## Open Questions

- Consolidar `components/admin/categories/delete-confirm-dialog.tsx` no `DeleteConfirmDialog` existente ou apenas migrar o estilo? Decidir durante a implementação conforme a divergência de props.
- O tom `promo` deve ser um novo `tone` do `Badge` ou um uso direto de `.badge-promo`? Preferência por `tone="promo"` para manter o componente como único ponto de entrada.
- O halo de 12px do focus ring aplica-se a todos os inputs ou apenas ao search pill? A spec atual só exige o search pill; manter o halo nos demais é uma extensão visual aceitável, mas será validada no review.
