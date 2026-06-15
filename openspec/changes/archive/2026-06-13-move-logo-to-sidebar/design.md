## Context

Atualmente a logo oficial da DevAI Store (`/logo.svg`) é renderizada de forma redundante no header global e na seção hero da página principal. Para otimizar o espaço e melhorar a experiência visual do usuário, a logo será transferida para o sidebar esquerdo (DesktopSidebar), e os locais originais serão limpos (hero sem logo, header com texto "DevAI").

## Goals / Non-Goals

**Goals:**
- Remover a logo oficial da seção hero da página inicial.
- Substituir a logo oficial no header por texto puro "DevAI".
- Integrar a logo oficial no cabeçalho do sidebar lateral (DesktopSidebar).

**Non-Goals:**
- Modificar o arquivo da logo oficial (`/logo.svg`).
- Alterar cores ou estilos adicionais fora da logo e dos contêineres afetados.

## Decisions

### Decisão 1: Posicionamento e dimensionamento no Sidebar
- **Escolha**: Renderizar o logotipo no sidebar lateral usando `<Image>` do Next.js com as dimensões de `width={120}` e `height={36}` para que caiba harmoniosamente no container `.sidebar-header` (que possui `height: 4rem` e `padding: 0 1.5rem`).
- **Alternativa Considerada**: Manter o tamanho original de `200x60`.
- **Razão da Escolha**: O contêiner de sidebar tem `width: 16rem` (256px), então uma largura de `120px` centralizada ou alinhada à esquerda com padding lateral de `1.5rem` (`24px` de cada lado) deixa espaço adequado e visualmente balanceado.

### Decisão 2: Restauração do Header
- **Escolha**: Substituir a logo no header pelo texto puro "DevAI" usando os estilos existentes da classe `.header-logo`.
- **Razão da Escolha**: Mantém a integridade do link da página inicial mantendo a identidade textual histórica e a consistência com o restante do header.

## Risks / Trade-offs

- **[Risco]** Quebra ou desalinhamento no cabeçalho do sidebar.
  - **Mitigação**: O uso de `width={120}` e `height={36}` garante que a altura seja menor que os `64px` (`4rem`) do container, e a classe `flex items-center` centraliza verticalmente a imagem.
