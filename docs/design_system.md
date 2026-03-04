# Design System

Este documento define os padrões de implementação para o projeto
**DevAI**. O objetivo é garantir uma interface **premium, minimalista e
com estética AI-driven**, assegurando consistência visual,
previsibilidade e independência de framework.

------------------------------------------------------------------------

## 1. Core Tokens (Variáveis de Sistema)

### 1.1 Cores Semânticas

``` json
{
  "theme": "light",
  "colors": {
    "brand": {
      "primary": "#4F46E5",
      "primary-hover": "#4338CA",
      "accent": "#06B6D4",
      "glass-bg": "rgba(255, 255, 255, 0.7)"
    },
    "neutral": {
      "surface": "#F8FAFC",
      "canvas": "#FFFFFF",
      "border": "#E2E8F0",
      "text-strong": "#0F172A",
      "text-muted": "#64748B"
    },
    "status": {
      "success": "#10B981",
      "error": "#EF4444",
      "warning": "#F59E0B"
    }
  }
}
```

#### Diretrizes

-   Tokens são a única fonte de verdade para cores.
-   Evitar valores hardcoded na implementação.
-   Estados interativos devem derivar de tokens semânticos.

------------------------------------------------------------------------

### 1.2 Geometria e Elevação

``` json
{
  "rounding": {
    "standard": "12px",
    "pill": "9999px",
    "card": "20px"
  },
  "elevation": {
    "soft": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
    "premium": "0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)",
    "hover": "0 25px 50px -12px rgba(0,0,0,0.15)"
  }
}
```

#### Diretrizes

-   Elevação comunica hierarquia.
-   Hover deve sempre aumentar percepção de profundidade.
-   Evitar sombras excessivas fora dos padrões definidos.

------------------------------------------------------------------------

## 2. Componentes de Alta Fidelidade

### 2.1 Card de Produto (Refined)

#### Container

-   Background: `neutral.canvas`
-   Borda: `1px solid neutral.border`
-   Border-radius: `rounding.card`
-   Sombra padrão: `elevation.premium`

#### Hover

-   Transição para `elevation.hover`
-   Duração recomendada: `300ms`
-   Transição suave e não abrupta

#### Imagem

-   Padding interno: `8px`
-   Border-radius interno: `rounding.standard`
-   A imagem nunca deve tocar diretamente as bordas externas

#### Badges

Exemplo: "Indisponível" - Fundo: `neutral.surface` - Texto:
`neutral.text-muted` - Opacidade: `80%` - Sempre utilizar tokens de
status quando aplicável

------------------------------------------------------------------------

### 2.2 Botões (Actions)

#### Estilo Primário

-   Background: `brand.primary`
-   Sem borda
-   Texto branco
-   Peso tipográfico: `600`

#### Interação

-   Hover com leve deslocamento vertical (`translateY(-2px)`)
-   Transição suave entre 200ms e 300ms
-   Estados obrigatórios: hover, focus, disabled

------------------------------------------------------------------------

### 2.3 Header (Glassmorphism)

#### Efeito Visual

-   Aplicar `backdrop-filter: blur(10px)`
-   Fundo derivado de `brand.glass-bg`

#### Borda

-   Apenas borda inferior
-   Cor baseada em `neutral.border` com opacidade reduzida

------------------------------------------------------------------------

## 3. Regras de Layout e UX

### Grid

-   Espaçamento fixo de `32px` entre itens principais.

### Container

-   Centralizado.
-   Largura máxima recomendada: `1280px`.

### Empty States

-   Ícones lineares leves.
-   Cor: `#94A3B8`
-   Texto centralizado.
-   Linguagem clara, orientada à ação.

### Loading

-   Utilizar Skeleton Screens.
-   Gradiente pulsante discreto.
-   Estrutura deve refletir layout final do componente.

------------------------------------------------------------------------

## 4. Tipografia

### Font Family

`'Inter', system-ui, -apple-system, sans-serif`

### Headings

-   Peso: `700`
-   Letter-spacing: `-0.02em`

### Body

-   Peso: `400`
-   Line-height: `1.6`

------------------------------------------------------------------------

## 5. Princípios Estruturais

1.  Tokens são obrigatórios e centralizados.
2.  Componentes devem ser semanticamente nomeados.
3.  Estados visuais são obrigatórios (hover, focus, loading, disabled).
4.  Consistência visual supera customizações isoladas.
5.  O sistema deve ser independente de frameworks ou bibliotecas
    específicas.

------------------------------------------------------------------------
