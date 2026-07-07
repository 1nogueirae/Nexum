# 06 — Decisões (ADR resumido)

Este documento registra as principais decisões já tomadas para o Nexum, no formato resumido "Decisão / Contexto / Alternativas consideradas / Consequências".

---

## D01 — Empréstimos sem juros (apenas valor principal)

**Contexto:** Definir se o domínio precisa modelar juros, correção monetária ou multas.

**Decisão:** O MVP e o modelo de domínio não incluem juros. O saldo devedor é sempre `valor emprestado − soma de pagamentos`.

**Alternativas consideradas:** Juros simples; juros compostos; campo de taxa configurável por empréstimo.

**Consequências:** Modelo de domínio significativamente mais simples (sem necessidade de datas de referência para cálculo de juros, sem taxas, sem periodicidade). Caso juros sejam necessários no futuro, serão um módulo opcional e isolado, não uma alteração no núcleo do domínio.

---

## D02 — Direção única do empréstimo (apenas dinheiro concedido pelo usuário)

**Contexto:** Definir se o app deveria controlar também dívidas do próprio usuário com terceiros.

**Decisão:** Nexum registra exclusivamente dinheiro que o usuário empresta a outras pessoas.

**Alternativas consideradas:** Modelo bidirecional, com um campo `tipo` (`concedido` / `recebido`) em cada empréstimo.

**Consequências:** Modelo mental do app permanece simples ("quem me deve, e quanto"). Elimina a necessidade de somar/subtrair saldos em direções opostas na Home e nas listagens. Se essa necessidade surgir no futuro, será tratada como uma nova entidade paralela, não como extensão do modelo atual.

---

## D03 — Moeda fixa em Real (BRL)

**Contexto:** Definir se o app precisa suportar múltiplas moedas.

**Decisão:** Moeda fixa em BRL, sem seleção de moeda pelo usuário.

**Alternativas consideradas:** Campo de moeda por pessoa/empréstimo; conversão automática via API externa.

**Consequências:** Elimina complexidade de formatação/conversão de moedas e qualquer dependência de rede para taxas de câmbio, mantendo o app 100% offline. Simplifica o Value Object `Money` (apenas um inteiro em centavos, sem código de moeda associado).

---

## D04 — Sem backend e sem autenticação no MVP

**Contexto:** Definir se o MVP precisa de conta de usuário ou servidor.

**Decisão:** O MVP é 100% local e offline, sem login e sem backend.

**Alternativas consideradas:** Autenticação local simples (PIN/biometria); backend próprio desde o início.

**Consequências:** Reduz drasticamente a superfície de implementação inicial. Abre espaço para, futuramente, adicionar autenticação local (ex.: biometria) como camada opcional de segurança do dispositivo, sem relação com "contas de usuário" — e sincronização remota como evolução posterior e desacoplada.

---

## D05 — Persistência local com Isar

**Contexto:** Escolher o mecanismo de banco local entre Isar e SQLite (sqflite).

**Decisão:** Isar como banco de dados local principal.

**Alternativas consideradas:** SQLite via `sqflite`; Hive (descartado por ser menos adequado a dados relacionais).

**Consequências:** Maior produtividade (schemas tipados em Dart, sem SQL manual) e suporte nativo a queries reativas, importante para atualizar a UI automaticamente quando o saldo devedor muda. Justificativa completa em `04-arquitetura.md` e `09-banco.md`.

---

## D06 — Gerenciamento de estado com Riverpod

**Contexto:** Escolher entre Riverpod, Bloc, Provider (legado) ou GetX.

**Decisão:** Riverpod.

**Alternativas consideradas:** Bloc (mais verboso para as necessidades do app); Provider clássico (superado pelo próprio Riverpod); GetX (menos alinhado a boas práticas de testabilidade e separação de camadas).

**Consequências:** Boa testabilidade dos casos de uso, injeção de dependência simples, sem necessidade de `BuildContext` na camada de aplicação.

---

## D07 — Arquitetura em camadas simplificada (sem abstrações prematuras)

**Contexto:** Definir o nível de rigor arquitetural apropriado para um projeto solo de portfólio.

**Decisão:** Adotar separação Domain / Application / Data / Presentation, mas sem interfaces abstratas onde exista apenas uma implementação concreta.

**Alternativas consideradas:** Clean Architecture "completa", com interfaces abstratas para cada repositório desde o início.

**Consequências:** Código mais direto e fácil de manter por uma única pessoa, sem perder a separação de responsabilidades necessária para futura evolução (ex.: sincronização). Abstrações serão adicionadas apenas quando houver uma segunda implementação real a suportar.

---

## D08 — Valores monetários como inteiros em centavos

**Contexto:** Evitar erros de arredondamento inerentes a `double` em cálculos financeiros.

**Decisão:** Todo valor monetário é armazenado e manipulado como `int` (centavos), nunca como `double`.

**Alternativas consideradas:** Uso de `double`; uso de pacotes de decimal de precisão arbitrária.

**Consequências:** Elimina uma classe inteira de bugs de arredondamento sem exigir dependências externas. Formatação para exibição (R$ 1.234,56) é responsabilidade exclusiva da camada de apresentação.

---

## D09 — Status do empréstimo como cache derivado, não fonte de verdade

**Contexto:** Definir se "ativo/quitado" é um campo independente ou sempre calculado.

**Decisão:** O saldo devedor é sempre calculado a partir dos pagamentos; o campo `status` no banco é um cache de leitura, recalculado a cada escrita relevante (criar/editar/excluir pagamento, editar/excluir empréstimo).

**Alternativas consideradas:** Calcular status sempre em tempo real na consulta (sem persistir), evitando cache.

**Consequências:** Permite consultas rápidas por status (ex.: "listar ativos") sem precisar buscar e somar pagamentos de todos os empréstimos a cada tela. Exige disciplina para garantir que toda operação que afeta pagamentos also atualize o cache (centralizado no `OutStandingBalanceService`, ver `04-arquitetura.md`).

---

## D10 — Exclusão em cascata

**Contexto:** Definir o comportamento ao excluir pessoa/empréstimo com dados filhos.

**Decisão:** Excluir uma pessoa remove seus empréstimos; excluir um empréstimo remove seus pagamentos — sempre mediante confirmação explícita do usuário.

**Alternativas consideradas:** Exclusão "soft" (marcação como inativo, sem remoção física).

**Consequências:** Modelo de dados mais simples (sem necessidade de filtrar registros "excluídos" em todas as queries). Custo: perda definitiva do histórico ao excluir — mitigado por exigir confirmação explícita e exibir o impacto (ex.: saldo devedor envolvido) antes da exclusão.