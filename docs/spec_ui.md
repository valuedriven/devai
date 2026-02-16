# Especificação de UI

## Interfaces gráficas

### INT-01 Página Principal

- Página contendo:
  - Barra superior: Logo, Barra de busca de produtos, Carrinho de compras, Perfil usuário logado ou botão Login.
  - Menu lateral: Dashboard (admin), Produtos (admin), Clientes (admin), Pedidos.
  - Vitrine
    - Grid de cards com imagem, nome e preço formatado de produto.
    - Campos: -
    - Links: —
    - Botões: Adicionar ao carrinho (em cada card)    
  - Rodapé
- Campos: -
- Botões: -
- Links: -

### INT-02 Login

- Formulário para acesso e/ou cadastro.
- Campos: E-mail, Senha.
- Botões: Entrar.
- Links: Criar conta (define perfil Cliente no cadastro).

### INT-03 Carrinho de Compras

- Lista de produtos selecionados incluindo imagem, nome, quantidade, subtotal.
- Campos: Quantidade por item
- Botões: Confirmar Pedido
- Links: Excluir
- Exibição do valor total calculado automaticamente
- Pagamento não processado online. Pedido criado com status Novo.

### INT-04 Acompanhamento de Pedidos

- Lista histórica de pedidos: Número, Data, Total, Status (com badge visual)
- Campos: —
- Botões: —
- Links: Acessar Detalhe do Pedido

### INT-05 Detalhe do Pedido

- Formulario com número do pedido, Status do pedido, lista de produtos comprados.
- Cliente apenas visualiza.
- Campos: —
- Botões: Alterar Status (Admin).
- Links: —

### INT-06 Listagem de Categorias 

- Listagem e respectivos comandos.
- Campos: Nome da Categoria, Ativo (s/n).
- Botões: Cadastrar, Pesquisar, Editar, Excluir.
- Links: —

### INT-07 Listagem de Produtos

- Listagem e respectivos comandos.
- Campos: Nome do Produto, Imagem (miniatura), Descrição, Preço, Estoque, Categoria, Ativo (s/n).
- Botões: Cadastrar, Pesquisar, Editar, Excluir.
- Links: —

### INT-08 Edição de Produtos

- Formulário para criação e edição
- Campos: Nome do Produto, Imagem, Descrição, Preço, Estoque, Categoria, Ativo (s/n).
- Botões: Salvar, Cancelar.
- Links: —

### INT-09 Listagem de Clientes

- Listagem e respectivos comandos.
- Campos: Nome do cliente, Endereço, e-mail, Telefone.
- Botões: Cadastrar, Pesquisar, Editar, Excluir.
- Links: —

### INT-10 Edição de Clientes

- Formulário com dados de cada cliente.
- Campos: Nome do cliente, Endereço, e-mail, Telefone.
- Botões: Salvar, Cancelar.
- Links: —

### INT-11 Gestão de Pedidos

- Lista com dados de cada pedido: ID, Data, Total, Status (com badge visual)
- Campos: —
- Botões: —
- Links: Acessar Detalhe do Pedido

### INT-12 Dashboard

- Grid com cards de métricas (KPIs): Total de Vendas, Valor Recebido (R$), Valor Pendente (R$).
- Exclusivo do administrador.
- Lista resumida dos últimos 5 pedidos.
- Links: Produtos, Clientes, Pedidos.


### Mapeamento de Status do Pedido para Badge (UI)

Para garantir consistência visual, semântica e acessibilidade na representação do status dos pedidos, cada status deverá ser apresentado por meio de um componente **Badge**, utilizando os *tones* definidos no Design System.

| Status do Pedido | Contexto | Badge tone | Semântica |
|------------------|----------|------------|-----------|
| Novo             | Operacional | neutral | Pedido criado, ainda sem ação financeira |
| Pago             | Financeiro  | success | Pagamento confirmado |
| Preparação       | Operacional | info | Pedido em preparação |
| Faturado         | Financeiro  | info | Pedido faturado |
| Despachado       | Operacional | info | Pedido enviado ao cliente |
| Entregue         | Operacional | success | Pedido concluído com sucesso |
| Cancelado        | Operacional | error | Pedido cancelado |

**Diretrizes de uso:**
- O componente **Badge** deve utilizar exclusivamente tokens semânticos do Design System.
- Não devem ser utilizados valores visuais fixos (cores hardcoded).
- O status deve ser sempre visível em listas, detalhes do pedido e dashboards.
- Mudanças de status devem refletir imediatamente a atualização do Badge.
- O uso do *tone* deve reforçar a semântica do estado do pedido, evitando ambiguidade visual.

---

## Fluxo de Navegação

### Home (Página Principal)

- Barra Principal
- Menu Lateral
- Vitrine
- Rodape

### Fluxo de Compra

- Busca: Resultados de Pesquisa
- Produto: Detalhes, Preço
- Carrinho: Resumo de Itens
- Checkout:
    Identificação (Login/Cadastro)
    Envio (Endereço e Frete)
    Pagamento
    Confirmação do Pedido

### Menu Lateral

  Dashboard
  Categorias
  Produtos
  Clientes 
  Pedidos

---

## Entidades

### Principais Entidades

- Categoria: Nome da Categoria, Ativo.
- Produto: Nome do Produto, Categoria, Imagem, Descrição, Estoque, Ativo.
- Cliente: Nome do cliente, Endereço, e-mail, Telefone, Ativo.
- Pedido: Número do Pedido, Valor Total, Identificação do Cliente, Endereço de entrega, Status do Pedido, Data de pagamento, Método de pagamento.
- Item de Pedido: Identificação do Pedido, Identificação do Produto, Preço Unitário, Quantidade.

### Domínios

- Status do Pedido: Novo, Pago, Preparação, Faturado, Despachado, Entregue, Cancelado.
- Métodos de Pagamento: Cartão de Crédito, Cartão de Débito, Pix, Dinheiro.

**Regras de Transição do Status do Pedido:**

- `Novo` → `Cancelado` (permitido)
- `Novo` → `Pago` → `Preparação` → `Faturado` → `Despachado` → `Entregue` (sequencial)
- Qualquer estado (exceto `Entregue` e `Cancelado`) → `Cancelado` (permitido)

---

## Diretrizes para IA

- Este documento será utilizado para criar protótipos e wireframes em ferramentas como o Google Stitch
- Gerar interfaces alinhadas ao mapa de navegação e aos fluxos definidos
- Manter nomenclatura consistente entre telas
- Utilizar componentes reutilizáveis sempre que possível
- Respeitar hierarquia visual e espaçamentos do UX Design
- Garantir que ações administrativas estejam protegidas por verificação de perfil
- Implementar estados de loading e vazio em todas as listagens
- Usar badges de status conforme paleta definida
- Validar campos de formulário em tempo real quando possível
- Confirmar ações destrutivas antes de executar
- Implementar navegação por teclado para acessibilidade
