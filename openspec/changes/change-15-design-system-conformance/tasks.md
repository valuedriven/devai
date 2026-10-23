# Tasks — Design System Conformance (Gap Closure)

## 1. Tokens e base CSS

- [ ] 1.1 Adicionar ao `:root` de `apps/frontend/src/app/globals.css` os seis accents do design.md (`accent-pink`, `accent-pink-soft`, `accent-purple-soft`, `accent-purple-pale`, `accent-teal`, `accent-pink-deep`).
- [ ] 1.2 Adicionar as tiers `--type-button-md-*`, `--type-button-lg-*` e `--type-link-md-*` com os valores do front matter.
- [ ] 1.3 Redefinir `.btn-lg` para manter `height: var(--space-section)` (48px), alterando apenas padding horizontal/fonte dentro da escala.
- [ ] 1.4 Migrar `.btn`, `.card-*`, `.login-card`, `.footer-container` e `.container` de `rem` cru para `--space-*`/`--type-*`, documentando as exceções (hairline 1px, halo de 12px).
- [ ] 1.5 Remover o utilitário ambíguo `.bg-black` (hoje ink a 50%) e os aliases legados sem consumidores; manter ponte apenas para o que ainda for usado nesta change.
- [ ] 1.6 Adicionar suporte a `tone="promo"` no `Badge` (canvas + hairline + ink, `caption-sm`, 30px) e manter `.badge-promo` como classe canônica.

## 2. Containers e raios

- [ ] 2.1 PDP: frame da imagem em `rounded-none`, `background: var(--color-soft-cloud)`, sem `border` e sem sombra (`products/[id]/page.tsx`).
- [ ] 2.2 Home: empty state de catálogo sem `rounded-lg` (0px).
- [ ] 2.3 Modais: `CategoryManager`, `DeleteConfirmDialog`, `categories/category-form`, `categories/delete-confirm-dialog`, `PaymentRegistrationModal` e painel de filtros de `admin/orders` com superfície 0px.
- [ ] 2.4 Toast: container sem `rounded-lg` e sem `border-l-4`, usando hairline de 1px e superfície flat.
- [ ] 2.5 Perfil: caixas de ícone em `rounded-none` (ou raio 18px de avatar quando for container de avatar) e remover `shadow-lg` do avatar.
- [ ] 2.6 Rodar grep de aceite: nenhum `rounded-lg` aplicado a container/imagem/dialog/toast.

## 3. CTAs e alvos de toque

- [ ] 3.1 Remover overrides `h-8 w-8` de botões `size="icon"` no carrinho e nas tabelas admin; garantir 40px mínimos.
- [ ] 3.2 Migrar botões crus do admin (`admin/products/page.tsx` filtro, `categories/*` dialog/form) para o componente `Button`.
- [ ] 3.3 Confirmar que todo CTA `size="lg"` renderiza 48px de altura (carrinho, checkout, sucesso, PDP).
- [ ] 3.4 PDP: trocar o input inline de frete por `Input` + `Button`, preservando comportamento e testids.
- [ ] 3.5 Ajustar padding horizontal dos CTAs de 48px onde o layout do carrinho/checkout ficar apertado, sem alterar a altura.

## 4. Badges e catálogo

- [ ] 4.1 `ProductCard`: "Esgotado" e "Indisponível" passam a `tone="promo"` (canvas + hairline + ink).
- [ ] 4.2 Revisar `badge-error`/`text-destructive` para que `sale`/`sale-deep` só apareça em preço e mensagens de erro, nunca em estado de catálogo.
- [ ] 4.3 Garantir que `.badge-sale-text` permaneça disponível e sem uso decorativo.

## 5. Composição e acessibilidade

- [ ] 5.1 Substituir `<Link><Button/></Link>` por `<Link className={buttonVariants(...)}>` em `cart`, `checkout`, `checkout/success`, `orders` e `orders/[id]`.
- [ ] 5.2 Aplicar o mesmo padrão na `DesktopSidebar`, `CustomerForm`, `CategoryForm` e `ProductForm`.
- [ ] 5.3 Verificar no DOM renderizado que não existe `<a>` contendo `<button>` (storefront e admin).

## 6. Tipografia

- [ ] 6.1 `.section-title` passa a usar `--type-heading-xl-*` sem `text-transform: uppercase`.
- [ ] 6.2 Headings de auth (`LoginForm.css`, `RegisterForm.css`) de 28px para a tier documentada (32px ou 24px).
- [ ] 6.3 Heading do perfil de 18px para `heading-lg`; remover `text-lg` do badge de status no detalhe do pedido.
- [ ] 6.4 Revisar se sobrou peso 600/700 em chrome text.

## 7. Admin em um único sistema

- [ ] 7.1 `(admin)/layout.tsx`: página em canvas (`#ffffff`), mantendo header 64px + hairline.
- [ ] 7.2 Migrar `components/admin/categories/delete-confirm-dialog.tsx` e `category-form.tsx` para `Card` + `Button` + `Input`, com copy em pt-BR.
- [ ] 7.3 Consolidar o dialog duplicado no `DeleteConfirmDialog` existente se as props convergirem; caso contrário, registrar o follow-up no change.
- [ ] 7.4 Substituir utilitários `bg-red-600`, `bg-blue-600`, `text-gray-*`, `border-slate-*` e `bg-red-50` nos TSX admin por classes do vocabulário.

## 8. Limpeza final

- [ ] 8.1 Remover `shadow-lg`/`shadow-xl`/`shadow-sm` dos TSX (toast, orders, dialogs, profile, admin orders).
- [ ] 8.2 Substituir `style={{ marginRight }}` e afins por utilitários/classes da escala quando aplicável.
- [ ] 8.3 Rodar grep final: nenhum hex fora da paleta, nenhum `shadow-*` em TSX, nenhum `rounded-lg` em container, nenhum `h-8 w-8` em `Button`.

## 9. Testes

- [ ] 9.1 Atualizar `apps/frontend/tests/plans/design-system-alignment.md` usando `.agents/prompts/playwright-test-planner.md`, cobrindo os novos cenários (containers 0px, CTA 48px, ícone 40px, badge promo, PDP, ausência de `a > button`).
- [ ] 9.2 Gerar/ajustar os specs com `.agents/prompts/playwright-test-generator.md`, preservando `data-testid` e o escopo `:visible`.
- [ ] 9.3 Em `design-system-alignment.spec.ts`, assertar valores computados de product card (`0px`, `box-shadow: none`), CTA primário (`48px`, `30px`), chip ativo (fundo ink), search pill (`24px`, `40px`) e ícone do header (`40px`, `9999px`).
- [ ] 9.4 Em `design-system-alignment-admin.spec.ts`, assertar dialog admin (0px, sem sombra), botão primário (48px/30px) e badge promo (canvas).
- [ ] 9.5 Adicionar cenário de PDP (frame flat, preço 24px) e de composição (sem `<a><button>`).

## 10. Validação e aceite

- [ ] 10.1 `npm run lint --workspace=frontend` sem novos erros.
- [ ] 10.2 `npm run build --workspace=frontend`.
- [ ] 10.3 Rodar os specs de alinhamento: `npx playwright test design-system-alignment --workers=1`.
- [ ] 10.4 Rodar `npm run test` e `npm run lint` na raiz antes de concluir.
- [ ] 10.5 Passada visual em 1440 / 1024 / 390 nas telas home, PDP, carrinho, checkout, perfil, admin/orders e admin/products.
- [ ] 10.6 Revisar o diff garantindo que nenhum `data-testid`, fluxo ou contrato de API foi alterado.
