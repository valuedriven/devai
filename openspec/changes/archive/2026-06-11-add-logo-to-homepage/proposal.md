## Why

O site atualmente utiliza texto puro ("DevAI") no header e não exibe a marca visual oficial na página inicial. Esta alteração introduz o logotipo oficial "DevAI Logo" obtido do projeto Stitch na página principal e no header do e-commerce, melhorando a consistência visual e o branding.

## What Changes

- Adição da imagem SVG da logo oficial ("DevAI Logo") na seção Hero da página principal (`apps/frontend/src/app/(shop)/page.tsx`).
- Substituição do texto puro "DevAI" no header (`apps/frontend/src/components/layout/Header.tsx`) pelo logotipo oficial.
- Inclusão do arquivo de logo SVG no diretório de assets públicos do frontend (`apps/frontend/public/logo.svg`).

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- Nenhuma.

## Impact

- **Frontend**: Componente `Header.tsx`, página `(shop)/page.tsx`, diretório `public/` para armazenar o arquivo SVG.
