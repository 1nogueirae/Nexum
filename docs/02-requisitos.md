# 02 — Requisitos

## Premissas confirmadas

- Empréstimos **sem juros** — apenas controle de valor principal.
- Nexum registra **somente** dinheiro emprestado **pelo usuário a terceiros** (direção única).
- Moeda **fixa em BRL (R$)**, sem suporte a múltiplas moedas no MVP.
- Sem login, sem backend, sem sincronização no MVP.

---

## Requisitos Funcionais (RF)

### Pessoas

| ID | Descrição |
|---|---|
| RF01 | O sistema deve permitir cadastrar uma pessoa com nome (obrigatório) e informações de contato opcionais (telefone, observação). |
| RF02 | O sistema deve permitir editar os dados de uma pessoa já cadastrada. |
| RF03 | O sistema deve permitir excluir uma pessoa. |
| RF04 | O sistema deve impedir (ou alertar sobre) a exclusão de uma pessoa que possua empréstimos ativos. |
| RF05 | O sistema deve permitir pesquisar pessoas por nome. |
| RF06 | O sistema deve listar todas as pessoas cadastradas, com indicação resumida do saldo devedor total de cada uma. |

### Empréstimos

| ID | Descrição |
|---|---|
| RF07 | O sistema deve permitir registrar um novo empréstimo vinculado a uma pessoa, com valor e data. |
| RF08 | O sistema deve permitir adicionar uma descrição/observação opcional ao empréstimo. |
| RF09 | O sistema deve permitir editar um empréstimo (dados cadastrais, não o saldo diretamente). |
| RF10 | O sistema deve permitir excluir um empréstimo. |
| RF11 | O sistema deve calcular automaticamente o saldo devedor de cada empréstimo (valor emprestado − soma dos pagamentos). |
| RF12 | O sistema deve listar os empréstimos **ativos** (saldo devedor > 0). |
| RF13 | O sistema deve listar os empréstimos **quitados** (saldo devedor = 0). |
| RF14 | O sistema deve exibir o histórico de um empréstimo (dados do empréstimo + todos os pagamentos). |

### Pagamentos

| ID | Descrição |
|---|---|
| RF15 | O sistema deve permitir registrar um pagamento parcial em um empréstimo, com valor e data. |
| RF16 | O sistema deve permitir registrar a quitação total de um empréstimo com saldo remanescente. |
| RF17 | O sistema deve permitir excluir um pagamento registrado por engano, recalculando o saldo devedor automaticamente. |
| RF18 | O sistema deve impedir o registro de pagamento com valor superior ao saldo devedor atual do empréstimo. |
| RF19 | O sistema deve atualizar automaticamente o status do empréstimo (ativo → quitado) quando o saldo devedor chegar a zero. |

### Histórico e navegação

| ID | Descrição |
|---|---|
| RF20 | O sistema deve exibir, na tela da pessoa, a lista de todos os seus empréstimos (ativos e quitados). |
| RF21 | O sistema deve exibir uma visão geral (Home) com total emprestado ativo, número de pessoas devedoras e empréstimos recentes. |

---

## Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição |
|---|---|---|
| RNF01 | Desempenho | Todas as operações de listagem e cálculo de saldo devem ocorrer em menos de 300ms para até 10.000 registros locais. |
| RNF02 | Usabilidade | Qualquer fluxo principal (cadastrar pessoa, registrar pagamento) deve ser executável em no máximo 3 toques a partir da Home. |
| RNF03 | Disponibilidade | O aplicativo deve funcionar 100% offline, sem qualquer dependência de rede no MVP. |
| RNF04 | Confiabilidade | Nenhuma operação de escrita (criar/editar/excluir) pode deixar o banco em estado inconsistente (ex.: saldo divergente da soma real de pagamentos). |
| RNF05 | Portabilidade | O app deve rodar nos dispositivos Android suportados pela versão vigente do Expo SDK adotada pelo projeto (ver `04-arquitetura.md`). |
| RNF06 | Manutenibilidade | O código deve seguir separação clara de camadas (ver `04-arquitetura.md`) para permitir evolução (ex.: sincronização) sem reescrita. |
| RNF07 | Consistência visual | Toda a interface deve seguir as diretrizes definidas em `10-guidelines.md`. |
| RNF08 | Simplicidade | Nenhuma tela do MVP pode conter mais de uma ação primária em destaque (evitar poluição de interface). |
| RNF09 | Persistência | Os dados devem ser armazenados localmente de forma durável, sobrevivendo a fechamento do app e reinicialização do dispositivo. |
| RNF10 | Localização | Valores monetários exibidos em Real (R$), formato brasileiro (ex.: R$ 1.234,56); datas em formato dd/mm/aaaa. |

---

## Regras de Negócio (RN)

| ID | Regra |
|---|---|
| RN01 | Um empréstimo pertence a exatamente uma pessoa. |
| RN02 | Um empréstimo possui zero ou mais pagamentos. |
| RN03 | O saldo devedor de um empréstimo é sempre `valor_emprestado - soma(pagamentos.valor)`. Nunca é armazenado como valor "solto" editável manualmente. |
| RN04 | Um empréstimo é considerado **quitado** quando seu saldo devedor é igual a zero. |
| RN05 | Um empréstimo é considerado **ativo** enquanto seu saldo devedor for maior que zero. |
| RN06 | Não é permitido registrar pagamento com valor menor ou igual a zero. |
| RN07 | Não é permitido registrar pagamento com valor superior ao saldo devedor atual (evita saldo negativo). |
| RN08 | "Quitar empréstimo" é uma ação de conveniência que registra automaticamente um pagamento igual ao saldo devedor restante. |
| RN09 | Editar um empréstimo permite alterar dados cadastrais (pessoa, data, descrição), mas **não permite alterar o valor original** se já existirem pagamentos registrados — para preservar a integridade do histórico. |
| RN10 | Excluir uma pessoa que possua empréstimos ativos deve exigir confirmação explícita, informando o saldo devedor total envolvido. |
| RN11 | Excluir um empréstimo remove também todos os seus pagamentos (exclusão em cascata), mediante confirmação explícita. |
| RN12 | Excluir um pagamento recalcula imediatamente o saldo devedor e o status (ativo/quitado) do empréstimo associado. |
| RN13 | Todo valor monetário é tratado internamente como inteiro em centavos, para evitar erros de arredondamento de ponto flutuante. |

---

## Critérios de Aceitação

### Cadastrar pessoa
- Dado que o usuário informa um nome válido, quando salvar, então a pessoa aparece na lista de pessoas.
- Dado que o nome está vazio, quando tentar salvar, então o sistema exibe erro de validação e não salva.

### Editar pessoa
- Dado que o usuário altera o nome de uma pessoa existente, quando salvar, então a lista e as telas de empréstimo refletem o novo nome imediatamente.

### Excluir pessoa
- Dado que a pessoa não possui empréstimos, quando o usuário confirmar exclusão, então a pessoa é removida sem aviso adicional.
- Dado que a pessoa possui empréstimo ativo, quando o usuário tentar excluir, então o sistema exibe alerta com o saldo devedor total antes de permitir a confirmação.

### Registrar empréstimo
- Dado que o usuário informa pessoa, valor (> 0) e data, quando salvar, então o empréstimo aparece na lista de ativos com saldo devedor igual ao valor emprestado.

### Registrar pagamento parcial
- Dado um empréstimo com saldo devedor de R$ 500, quando o usuário registra pagamento de R$ 200, então o novo saldo devedor exibido é R$ 300 e o empréstimo permanece ativo.
- Dado um pagamento de valor maior que o saldo devedor, quando o usuário tentar salvar, então o sistema bloqueia a ação e exibe mensagem de erro.

### Quitar empréstimo
- Dado um empréstimo com saldo devedor de R$ 300, quando o usuário aciona "Quitar", então um pagamento de R$ 300 é criado automaticamente, o saldo passa a R$ 0 e o empréstimo muda para o status "quitado".

### Visualizar histórico
- Dado um empréstimo com múltiplos pagamentos, quando o usuário abre seus detalhes, então vê a lista cronológica de todos os pagamentos com data e valor.

### Pesquisar pessoas
- Dado que o usuário digita parte de um nome na busca, então a lista é filtrada em tempo real exibindo apenas correspondências.

### Visualizar empréstimos ativos/quitados
- Dado que existem empréstimos com saldo > 0 e outros com saldo = 0, quando o usuário alterna entre as abas "Ativos" e "Quitados", então cada aba exibe exclusivamente os empréstimos do respectivo status.
