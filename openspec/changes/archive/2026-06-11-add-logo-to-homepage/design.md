## Context

Atualmente a logo oficial da DevAI Store não está integrada no frontend da aplicação. A marca oficial "DevAI Logo" está armazenada em um projeto do Stitch como um recurso visual em formato SVG de tamanho 200x60. Desejamos utilizar esse SVG localmente na aplicação frontend para evitar dependência externa direta de renderização e garantir performance no carregamento da marca no Header e na Página Principal.

## Goals / Non-Goals

**Goals:**
- Baixar e salvar a logo oficial no formato SVG em `apps/frontend/public/logo.svg`.
- Adicionar a imagem da logo na seção Hero da página principal (`apps/frontend/src/app/(shop)/page.tsx`) com renderização otimizada.
- Substituir o texto "DevAI" no Header (`apps/frontend/src/components/layout/Header.tsx`) pela logo SVG.

**Non-Goals:**
- Mudar o esquema de cores ou identidade visual do frontend além da inclusão da logo.
- Alterar as logos e layouts da área administrativa ou do painel de checkout neste momento.

## Decisions

### Decisão 1: Utilização de SVG Local (via Next.js `Image` ou Componente Inline)
- **Escolha**: Salvar o arquivo SVG em `apps/frontend/public/logo.svg` e utilizá-lo com o componente `<Image>` do Next.js.
- **Alternativa Considerada**: Criar um componente React inline para renderizar o SVG direto no código DOM.
- **Razão da Escolha**: O uso do arquivo na pasta `public/` com o componente `Image` do Next.js permite que o navegador faça o cache eficiente do asset e mantém o código dos componentes React mais limpo.

## Risks / Trade-offs

- **[Risco]** Tamanho incorreto ou quebra de layout responsivo.
  - **Mitigação**: O SVG do Stitch possui dimensões originais de 200x60. Utilizaremos classes CSS adequadas e propriedades `width` e `height` do Next.js `Image` com `object-fit` ou limites responsivos no CSS para evitar distorções no mobile.
