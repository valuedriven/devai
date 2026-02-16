# Definição de Requisitos do Produto (PRD)

## Descrição do produto

O **Problema** A falta de controle em pedidos e pagamentos gera prejuízos diários para o microempreendedor.

A **Solução** O SeWAI resolve isso com uma plataforma de fluxo duplo:

Para o **Cliente** Uma vitrine digital simples para realizar pedidos.

Para o **Empreendedor** Um painel de gestão completo, do pedido ao pagamento.

Nossos Diferenciais:

- **Simplicidade Radical** Adoção imediata e zero complexidade técnica.
- **Vitrine Profissional** Credibilidade instantânea para o catálogo de produtos.
- **Controle Financeiro** Fim da inadimplência e das perdas por esquecimento.

---

## Perfis de Usuário

### Administrador

- Problemas: o empreendedor sofre com perdas de vendas e sobrecarga por processo manual.
- Objetivos: realizar a gestão de vendas, por meio do fluxo de pedidos e pagamentos, além da manutenção de dados sobre produtos e clientes.
- Dados demográficos: faixa etária típica entre 18 e 60.
- Motivações: possibilitar ao cliente uma experiência única.
- Frustrações: falta de tempo para dedicar aos produtos.

### Cliente

- Problemas: dificuldade em pesquisar produtos.
- Objetivos: realizar pedidos de maneira simples e transparente.
- Dados demográficos: faixa etária típica entre 18 e 60.
- Motivações: ter informações para tomar boas decisões de compra.
- Frustrações: excesso de informalidade no atendimento.

### Autenticação e Acesso

- Cliente pode navegar na vitrine e preencher carrinho sem estarem autenticados.
- Cliente precisa estar logado para concluir pedido.
- Administrador deve estar logado para todas as ações.

---

## Principais Funcionalidades

### RFN-01 Vitrine de Produtos

- Permite ao cliente visualizar os produtos disponíveis em uma vitrine digital organizada em formato de catálogo.
- Exibe informações básicas dos produtos, como nome, descrição, preço e imagem, possibilitando a seleção de itens para compra.

Critérios de Aceitação:
✓ Produtos inativos não devem aparecer na vitrine
✓ Produtos sem estoque devem aparecer mas desabilitados

### RFN-02 Criação e Acompanhamento de Pedidos

- Permite ao cliente criar pedidos a partir da seleção de produtos e respectivas quantidades.
- Permite ao cliente visualizar o histórico de pedidos.
- Possibilita calcular automaticamente o valor total e informar dados básicos do cliente.
- Permite cancelar pedidos ainda não pagos.

Critérios de Aceitação:
✓ O sistema deve recalcular automaticamente o valor total do pedido sempre que a quantidade de um item for alterada
✓ Um pedido só pode ser confirmado se possuir pelo menos um produto selecionado

### RFN-03 Gestão de Categorias

- Permite ao administrador cadastrar, editar, remover e organizar categorias.

Critérios de Aceitação:
✓ Apenas usuários administradores podem criar, editar ou remover produtos

### RFN-04 Gestão de Produtos

- Permite ao administrador cadastrar, editar, remover e organizar produtos.
- Controla a visibilidade dos produtos na vitrine digital.

Critérios de Aceitação:
✓ Apenas usuários administradores podem criar, editar ou remover produtos
✓ Produtos marcados como inativos não devem ser exibidos na vitrine

### RFN-05 Gestão de Clientes

- Permite ao administrador manter o cadastro de clientes.
- Possibilita criar, consultar, atualizar e excluir registros de clientes associados aos pedidos.

Critérios de Aceitação:
✓ O sistema deve permitir associar um cliente existente a um novo pedido
✓ Clientes com pedidos associados não devem ser excluídos, apenas desativados
✓ Alterações nos dados do cliente devem ser refletidas nos pedidos futuros

### RFN-06 Gestão de Pedidos

- Permite ao administrador visualizar e acompanhar os pedidos por status.
- Possibilita identificar pedidos pendentes ou atrasados e movimentá-los entre os estados do fluxo.
- Permite ao administrador registrar e controlar os pagamentos associados aos pedidos.
- O registro de pagamento será manualmente realizado pelo administrador.
- O método de pagamento deve ser informado no momento do registro manual do pagamento.

Critérios de Aceitação:
✓ O administrador deve conseguir filtrar pedidos por status
✓ A mudança de status de um pedido deve ser registrada e refletida imediatamente

### RFN-07 Dashboard

- Permite ao administrador acompanhar o desempenho das vendas por meio de um dashboard.
- Apresenta vendas totais, valores recebidos e pendentes e filtros por período.

Critérios de Aceitação:
✓ O dashboard deve exibir corretamente os valores totais recebidos e pendentes para o período selecionado
✓ A aplicação de filtros por período deve atualizar os indicadores exibidos
✓ Os dados apresentados no dashboard devem refletir apenas pedidos registrados no sistema

---

## Requisitos Não Funcionais

### RNF-01 - Acessibilidade e Portabilidade

A solução deve ser acessível exclusivamente por navegadores web modernos compatíveis com HTML5, CSS3 e ECMAScript 2020 ou superior, e deve apresentar layout responsivo, garantindo uso adequado em diferentes tamanhos de tela.

### RNF-02 – Segurança

A solução deve garantir autenticação e autorização por meio de integração com serviços externos, assegurando controle de acesso por perfis de usuário, bem como confidencialidade e proteção de dados sensíveis em trânsito e em repouso.

### RNF-03 – Interoperabilidade

A solução deve expor suas funcionalidades exclusivamente por meio de APIs RESTful, utilizando os protocolos HTTP/HTTPS.

### RNF-04 – Observabilidade e Rastreabilidade

A solução deve implementar mecanismos de observabilidade conforme padrões abertos, permitindo o registro, a correlação e a consulta de eventos relevantes de execução, de forma a viabilizar monitoramento, auditoria e diagnóstico de falhas.

### RNF-05 – Manutenibilidade e Testabilidade

A solução deve possuir testes automatizados de unidade, integração e aceite, implementados com frameworks adotados no mercado, de modo a facilitar manutenção, evolução do código e detecção precoce de falhas.

### RNF-06 – Portabilidade e Implantação

A solução deve permitir implantação em diferentes ambientes computacionais, suportando escalabilidade e alta disponibilidade. Deve ser empacotada em contêineres compatíveis com o padrão OCI e possuir implantação automatizada por meio de Infraestrutura como Código, utilizando ferramentas de automação e permitindo a recriação completa dos ambientes.

### RNF-07 – Persistência

A solução deverá utilizar mecanismos de persistência baseados em banco de dados relacional e/ou NoSQL.

### RNF-08 – Governança de Código e Configuração

A solução deverá utilizar mecanismos formais para declaração, versionamento e isolamento de dependências. As configurações da aplicação deverão ser externalizadas por meio de variáveis de ambiente ou serviços especializados de configuração. O código-fonte e demais artefatos da solução deverão ser mantido em sistema de controle de versões distribuído e acessível via internet.

---

## Métricas de Sucesso

- Aumentar em 20% o Total recebido (R$) em 12 meses.
- Reduzir em 10% o Total pendente (R$) em 12 meses.

---

## Premissas e restrições

- O prazo de entrega do MVP é de um mês.
- O prazo de entrega da versão 1.0 é de seis meses.
- A stack tecnológica será definida em documento específico.

## Escopo

### Fora de Escopo (Versão 1.0)

- Conversas ou chat com clientes
- Divisão de pagamento
- Controle avançado de estoque (movimentações automáticas, alertas, histórico)
- CRM avançado de clientes
- Integração automática com gateways de pagamento

### Fora de Escopo (MVP)

- No MVP, a estratégia de tenancy será configurada, porém operando com um único tenant ativo.
- RNF-04, RNF-05, RNF-06. Entretanto, embora estejam fora do escopo funcional do MVP, sua arquitetura será preparada desde o início para suportá-los, com implementação gradual.
- No MVP, será utilizado um único schema, sem isolamento por tenant, mantendo o tenant_id apenas como preparação para evolução.