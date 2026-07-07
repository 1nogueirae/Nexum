# 07 — Fluxos de Usuário

Cada fluxo descreve o caminho feliz e as principais exceções/validações.

---

## Fluxo 1 — Cadastrar Pessoa

**Ponto de entrada:** Tela "Lista de Pessoas" → botão flutuante "+".

1. Usuário toca no botão "+" na lista de pessoas.
2. Sistema exibe formulário com campos: Nome (obrigatório), Telefone (opcional), Observação (opcional).
3. Usuário preenche o nome e toca em "Salvar".
4. Sistema valida que o nome não está vazio.
   - Se inválido: exibe mensagem de erro inline no campo, mantém o formulário aberto.
   - Se válido: persiste a pessoa e retorna à lista.
5. A nova pessoa aparece na lista, ordenada alfabeticamente, com saldo devedor R$ 0,00 (sem empréstimos ainda).

---

## Fluxo 2 — Editar Pessoa

**Ponto de entrada:** Tela "Detalhe da Pessoa" → ícone de edição.

1. Usuário abre o detalhe de uma pessoa e toca em "Editar".
2. Sistema exibe o mesmo formulário do cadastro, pré-preenchido.
3. Usuário altera os campos desejados e toca em "Salvar".
4. Sistema valida (mesma regra do cadastro) e persiste as alterações.
5. Sistema retorna à tela de detalhe, exibindo os dados atualizados.

---

## Fluxo 3 — Excluir Pessoa

**Ponto de entrada:** Tela "Detalhe da Pessoa" → menu de opções → "Excluir".

1. Usuário toca em "Excluir" no detalhe da pessoa.
2. Sistema verifica se a pessoa possui empréstimos ativos.
   - **Sem empréstimos ativos:** exibe diálogo de confirmação simples ("Excluir [Nome]? Esta ação não pode ser desfeita.").
   - **Com empréstimos ativos:** exibe diálogo de confirmação reforçado, informando o saldo devedor total envolvido ("[Nome] possui R$ X em empréstimos ativos. Excluir mesmo assim?").
3. Usuário confirma.
4. Sistema exclui a pessoa e, em cascata, todos os seus empréstimos e pagamentos associados (RN11 aplicada transitivamente).
5. Sistema retorna à lista de pessoas, sem o registro excluído.

**Exceção:** Usuário cancela no diálogo → nenhuma alteração é feita, permanece na tela de detalhe.

---

## Fluxo 4 — Criar Empréstimo

**Ponto de entrada:** Tela "Detalhe da Pessoa" → botão "Novo Empréstimo".

1. Usuário, dentro do detalhe de uma pessoa, toca em "Novo Empréstimo".
2. Sistema exibe formulário com: Valor (obrigatório), Data (obrigatório, padrão = hoje), Descrição (opcional).
3. Usuário preenche o valor e toca em "Salvar".
4. Sistema valida que o valor é maior que zero.
   - Se inválido: exibe erro inline, mantém formulário aberto.
   - Se válido: cria o empréstimo com status "ativo" e saldo devedor igual ao valor informado.
5. Sistema retorna ao detalhe da pessoa, exibindo o novo empréstimo na lista de empréstimos dessa pessoa.

---

## Fluxo 5 — Editar Empréstimo

**Ponto de entrada:** Tela "Detalhe do Empréstimo" → ícone de edição.

1. Usuário abre o detalhe de um empréstimo e toca em "Editar".
2. Sistema exibe formulário pré-preenchido (Pessoa, Valor, Data, Descrição).
3. **Regra especial (RN09):** se o empréstimo já possui pagamentos, o campo "Valor" é exibido como somente leitura, com uma explicação ("Não é possível alterar o valor original de um empréstimo com pagamentos registrados").
4. Usuário altera os campos permitidos e toca em "Salvar".
5. Sistema valida e persiste as alterações, retornando ao detalhe do empréstimo atualizado.

---

## Fluxo 6 — Registrar Pagamento (parcial)

**Ponto de entrada:** Tela "Detalhe do Empréstimo" → botão "Registrar Pagamento".

1. Usuário toca em "Registrar Pagamento" no detalhe de um empréstimo ativo.
2. Sistema exibe formulário com: Valor (obrigatório), Data (obrigatório, padrão = hoje), Observação (opcional). O saldo devedor atual é exibido como referência no topo do formulário.
3. Usuário informa o valor e toca em "Salvar".
4. Sistema valida:
   - Valor deve ser maior que zero (RN06).
   - Valor não pode exceder o saldo devedor atual (RN07/RN18).
   - Se inválido: exibe erro inline explicando o motivo (ex.: "O valor não pode ser maior que o saldo devedor de R$ X").
   - Se válido: registra o pagamento, recalcula o saldo devedor do empréstimo.
5. Sistema verifica se o novo saldo devedor é zero:
   - Se sim: atualiza o status do empréstimo para "quitado" automaticamente (RF19).
   - Se não: o empréstimo permanece "ativo" com o novo saldo.
6. Sistema retorna ao detalhe do empréstimo, exibindo o pagamento na lista de histórico e o saldo atualizado.

---

## Fluxo 7 — Quitar Empréstimo (ação de conveniência)

**Ponto de entrada:** Tela "Detalhe do Empréstimo" → botão "Quitar".

1. Usuário toca em "Quitar" em um empréstimo ativo.
2. Sistema exibe diálogo de confirmação informando o valor exato que será registrado como pagamento final (o saldo devedor atual).
3. Usuário confirma.
4. Sistema cria automaticamente um pagamento cujo valor é igual ao saldo devedor atual (RN08).
5. Sistema atualiza o saldo devedor para R$ 0,00 e o status do empréstimo para "quitado".
6. Sistema retorna ao detalhe do empréstimo, agora exibido como quitado, com o pagamento final visível no histórico.

---

## Fluxo 8 — Excluir Pagamento

**Ponto de entrada:** Tela "Detalhe do Empréstimo" → item de pagamento na lista → "Excluir".

1. Usuário toca em excluir sobre um pagamento específico no histórico.
2. Sistema exibe diálogo de confirmação simples.
3. Usuário confirma.
4. Sistema remove o pagamento e recalcula imediatamente o saldo devedor do empréstimo (RN12).
5. Se o empréstimo estava "quitado" e o saldo devedor volta a ser maior que zero, o status muda automaticamente para "ativo".
6. Sistema retorna ao detalhe do empréstimo com os valores atualizados.

---

## Fluxo 9 — Excluir Empréstimo

**Ponto de entrada:** Tela "Detalhe do Empréstimo" → menu de opções → "Excluir".

1. Usuário toca em "Excluir" no detalhe de um empréstimo.
2. Sistema exibe diálogo de confirmação, informando que todos os pagamentos associados também serão removidos (RN11).
3. Usuário confirma.
4. Sistema exclui o empréstimo e seus pagamentos em cascata.
5. Sistema retorna ao detalhe da pessoa, sem o empréstimo excluído na lista.

---

## Fluxo 10 — Pesquisar Pessoas

**Ponto de entrada:** Tela "Lista de Pessoas" → campo de busca no topo.

1. Usuário toca no campo de busca e digita parte de um nome.
2. Sistema filtra a lista em tempo real (a cada caractere digitado), exibindo apenas pessoas cujo nome contenha o texto buscado (case-insensitive).
3. Se nenhum resultado corresponder, sistema exibe estado vazio específico ("Nenhuma pessoa encontrada para '...'").
4. Usuário toca em um resultado para abrir o detalhe da pessoa, ou limpa a busca para voltar à lista completa.

---

## Fluxo 11 — Visualizar Empréstimos Ativos / Quitados

**Ponto de entrada:** Tela "Detalhe da Pessoa" (ou tela consolidada, conforme decisão de UI) → abas "Ativos" / "Quitados".

1. Usuário abre a lista de empréstimos de uma pessoa (ou a visão consolidada da Home).
2. Sistema exibe duas abas: "Ativos" e "Quitados".
3. Aba "Ativos" lista somente empréstimos com saldo devedor > 0, ordenados por data (mais recente primeiro), exibindo valor original e saldo devedor atual.
4. Aba "Quitados" lista somente empréstimos com saldo devedor = 0, exibindo valor original e data de quitação (data do último pagamento).
5. Usuário toca em qualquer item para abrir o detalhe completo do empréstimo (Fluxo de histórico).

---

## Fluxo 12 — Visualizar Histórico do Empréstimo

**Ponto de entrada:** Toque em qualquer empréstimo, a partir de qualquer lista.

1. Sistema abre a tela "Detalhe do Empréstimo", exibindo: pessoa vinculada, valor original, data, descrição, saldo devedor atual, status.
2. Abaixo, sistema exibe a lista cronológica de pagamentos (mais recente primeiro), cada um com valor, data e observação.
3. Usuário pode, a partir dessa tela, registrar novo pagamento, quitar, editar ou excluir o empréstimo (conforme fluxos anteriores).