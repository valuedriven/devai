## Context

O CLI `openspec` rejeita nomes de change que começam com número (ex: `01-backend-foundation` → "Change name must start with a letter"). Isso impede usar `--change`, `status`, `instructions`, `archive` e outros comandos do CLI que dependem do nome do diretório como identificador.

Todos os 11 diretórios de change existentes usam prefixo numérico sequencial (`02-`, `03-`, etc.).

## Goals / Non-Goals

**Goals:**
- Renomear todos os diretórios de change (ativos e arquivados) para usar prefixo `change-` + número sequencial
- Preservar todo o conteúdo interno (proposal.md, design.md, tasks.md, .openspec.yaml)
- Manter o `openspec list --json` funcional e consistente

**Non-Goals:**
- Alterar schema ou configuração do OpenSpec
- Modificar código da aplicação
- Alterar conteúdo interno dos diretórios de change

## Decisions

### Decisão 1: Prefixo `change-` em vez de `ch-` ou `c-`
- **Escolha**: Prefixo `change-` (ex: `change-02-frontend-foundation`)
- **Alternativa Considerada**: `ch-`, `c-`, `feature-`, `chg-`
- **Razão da Escolha**: Mais legível e auto-documentado. Mantém o número sequencial original para referência cruzada com documentação existente.
- **Consequência**: Diretórios ficam mais longos, mas semanticamente claros.

### Decisão 2: `mv` simples, sem alteração de config
- **Escolha**: `mv <old> <new>` em cada diretório
- **Alternativa Considerada**: Script com update de metadata, copiar e deletar
- **Razão da Escolha**: Nenhum arquivo de config referencia esses nomes (confirmado via grep). O CLI descobre changes por scan de diretório. `mv` é atômico e preserva permissões.
- **Consequência**: Operação de 1 minuto, sem side effects.

## Risks / Trade-offs

- **[Risk]** `openspec list --json` pode mostrar changes renomeadas como "novas" com 0 tasks.
  - **Mitigação**: Os changes `02` a `11` já estão como `no-tasks` (só têm proposal.md). O `01-backend-foundation` arquivado tem 51 tasks completas — após o rename, o CLI vai mostrar como "no-tasks" por perder o vínculo com o `.openspec.yaml` anterior. Como está arquivado, é aceitável.
