## Why

O logotipo oficial "DevAI Logo" está atualmente posicionado de forma redundante no header global e na seção hero da página principal. Para melhorar a distribuição visual e a experiência do usuário, moveremos o logotipo oficial para o cabeçalho do sidebar lateral (DesktopSidebar) e removeremos sua exibição do header e da seção hero.

## What Changes

- **Remoção** do logotipo SVG do header (`apps/frontend/src/components/layout/Header.tsx`) e restauração do branding com texto puro ("DevAI").
- **Remoção** da seção de logotipo da seção hero da página principal (`apps/frontend/src/app/(shop)/page.tsx`).
- **Adição** do logotipo SVG no cabeçalho do menu lateral (`apps/frontend/src/components/layout/DesktopSidebar.tsx`), substituindo o texto puro existente.

## Capabilities

### New Capabilities

*(Nenhuma)*

### Modified Capabilities

- `branding`: Atualização do requisito de renderização do logotipo oficial, que agora deve ser renderizado no topo do sidebar lateral em vez de no header e na seção hero.

## Impact

- **Frontend**:
  - `Header.tsx` (restaura texto puro no lugar da imagem do logo)
  - `page.tsx` (remove wrapper e imagem do logo)
  - `DesktopSidebar.tsx` (importa Image e adiciona o SVG no header do sidebar)
