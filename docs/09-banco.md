# 09 — Banco de Dados Local

## Tecnologia

O banco local será **SQLite**, acessado por `expo-sqlite`. A escolha é compatível com Expo Go, persiste dados entre reinicializações e oferece transações e integridade relacional.

## Convenções

- IDs públicos são UUIDs em texto.
- Datas e timestamps são armazenados como texto ISO 8601 em UTC; datas de negócio são formatadas em `dd/mm/aaaa` apenas na apresentação.
- Valores monetários são inteiros em centavos.
- Nomes do banco e colunas usam `snake_case`; entidades TypeScript usam `camelCase`.
- `PRAGMA foreign_keys = ON` é aplicado em toda abertura do banco.
- WAL deve ser habilitado na criação do banco para melhorar o comportamento geral de leitura/escrita.

## Tabela `people`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | TEXT | PRIMARY KEY, UUID |
| `name` | TEXT | NOT NULL, valor não vazio após trim |
| `phone` | TEXT | NULL |
| `note` | TEXT | NULL |
| `created_at` | TEXT | NOT NULL, ISO 8601 |
| `updated_at` | TEXT | NOT NULL, ISO 8601 |

Índice adicional em `name COLLATE NOCASE` para a pesquisa case-insensitive.

## Tabela `loans`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | TEXT | PRIMARY KEY, UUID |
| `person_id` | TEXT | NOT NULL, FK para `people(id)` com `ON DELETE CASCADE` |
| `amount_in_cents` | INTEGER | NOT NULL, maior que zero |
| `description` | TEXT | NULL |
| `date` | TEXT | NOT NULL, data ISO 8601 |
| `status` | TEXT | NOT NULL, `active` ou `paid` |
| `created_at` | TEXT | NOT NULL, ISO 8601 |
| `updated_at` | TEXT | NOT NULL, ISO 8601 |

Índices em `person_id`, `status` e `date`.

## Tabela `payments`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | TEXT | PRIMARY KEY, UUID |
| `loan_id` | TEXT | NOT NULL, FK para `loans(id)` com `ON DELETE CASCADE` |
| `amount_in_cents` | INTEGER | NOT NULL, maior que zero |
| `date` | TEXT | NOT NULL, data ISO 8601 |
| `note` | TEXT | NULL |
| `created_at` | TEXT | NOT NULL, ISO 8601 |

Índices em `loan_id` e `date`.

## Relacionamentos

| Origem | Destino | Cardinalidade | Regra |
|---|---|---|---|
| `people` | `loans` | 1:N | Exclusão da pessoa remove seus empréstimos. |
| `loans` | `payments` | 1:N | Exclusão do empréstimo remove seus pagamentos. |

## Saldo e status

O saldo devedor não é armazenado como coluna editável:

`outstandingBalance = loan.amountInCents − sum(payments.amountInCents)`

O campo `loans.status` é um cache de consulta. Na mesma transação que cria ou exclui um pagamento, ou altera um valor original permitido pela RN09, a aplicação:

1. soma os pagamentos do empréstimo;
2. valida que o resultado não supera o valor original;
3. define `paid` quando o saldo é zero e `active` nos demais casos;
4. atualiza `updated_at`.

A função de persistência responsável por pagamentos centraliza esse processo. Nenhuma tela altera `status` diretamente.

## Atomicidade

Devem ocorrer em transação exclusiva:

- registro ou exclusão de pagamento com recálculo do status;
- quitação do empréstimo;
- alteração do valor original, quando permitida;
- exclusões que dependam de validações imediatamente anteriores.

As cascatas são garantidas pelas foreign keys. Se qualquer etapa falhar, toda a operação é revertida.

## Atualização da interface

SQLite não é tratado como estado da interface. Depois de uma escrita bem-sucedida, a tela recarrega os dados afetados por meio das funções da funcionalidade correspondente. Estado temporário, como carregamento, erro e texto de busca, permanece em hooks locais.

## Migrations

- Cada mudança de schema recebe uma versão incremental.
- A versão aplicada é controlada por `PRAGMA user_version`.
- Migrations rodam em ordem e dentro de transações antes de liberar o app.
- Nenhuma migration publicada pode ser editada retroativamente; correções usam uma nova versão.
- Falha de migration impede o uso do banco e deve produzir erro técnico claro, sem apagar dados automaticamente.

## Integridade adicional

As restrições simples ficam no schema, mas regras que dependem de agregações — como impedir pagamentos acima do saldo — são validadas pela função da funcionalidade dentro da mesma transação da escrita.

## Preparação para sincronização futura

UUIDs e timestamps portáveis evitam dependência de IDs autoincrementais locais. Isso prepara o schema para futura sincronização sem implementar backend, fila ou resolução de conflitos no MVP.

## Referência oficial

- [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/)
