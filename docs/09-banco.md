# 09 — Banco de Dados Local

## Tecnologia

**Isar** (ver justificativa comparativa em `04-arquitetura.md`).

## Coleções (Collections)

### PersonModel

```dart
@collection
class PersonModel {
  Id id = Isar.autoIncrement;

  @Index(unique: true, replace: false)
  late String uuid;

  @Index(type: IndexType.value, caseSensitive: false)
  late String name;

  String? phone;
  String? note;

  late DateTime createdAt;
  late DateTime updatedAt;

  final loans = IsarLinks<LoanModel>();
}
```

### LoanModel

```dart
@collection
class LoanModel {
  Id id = Isar.autoIncrement;

  @Index(unique: true, replace: false)
  late String uuid;

  @Index()
  late String personUuid;

  late int amountInCents;
  String? description;

  @Index()
  late DateTime date;

  @Index()
  @enumerated
  late LoanStatus status; // active, paid

  late DateTime createdAt;
  late DateTime updatedAt;

  final payments = IsarLinks<PaymentModel>();

  final person = IsarLink<PersonModel>();
}

enum LoanStatus { active, paid }
```

### PaymentModel

```dart
@collection
class PaymentModel {
  Id id = Isar.autoIncrement;

  @Index(unique: true, replace: false)
  late String uuid;

  @Index()
  late String loanUuid;

  late int amountInCents;

  @Index()
  late DateTime date;

  String? note;
  late DateTime createdAt;

  final loan = IsarLink<LoanModel>();
}
```

---

## Relacionamentos

| Origem | Destino | Tipo Isar | Descrição |
| ------- | ------- | --------- | --------- |
| PersonModel | LoanModel | `IsarLinks` (1:N) | Uma pessoa tem vários empréstimos. |
| LoanModel | PersonModel | `IsarLink` (N:1) | Backlink para consulta reversa rápida. |
| LoanModel | PaymentModel | `IsarLinks` (1:N) | Um empréstimo tem vários pagamentos. |
| PaymentModel | LoanModel | `IsarLink` (N:1) | Backlink para consulta reversa rápida. |

> Observação: além dos links do Isar, mantenho os campos `personUuid` / `loanUuid` como chaves de referência explícitas. Isso simplifica queries diretas por índice (mais previsíveis do que navegar apenas por `IsarLinks`) e facilita uma futura migração de motor de persistência, caso necessário.

---

## Índices

| Coleção | Campo | Tipo | Justificativa |
| ------- | ----- | ---- | ------------- |
| PersonModel | `uuid` | único | Identificador estável e portável entre dispositivos (útil para futura sincronização). |
| PersonModel | `name` | valor, case-insensitive | Suporta a busca de pessoas (RF05) com performance, sem scan completo da tabela. |
| LoanModel | `uuid` | único | Mesma justificativa de portabilidade. |
| LoanModel | `personUuid` | valor | Acelera a consulta "listar empréstimos de uma pessoa" (usada nas telas de detalhe da pessoa). |
| LoanModel | `status` | valor | Acelera as consultas "listar ativos" e "listar quitados" (RF12/RF13), que são acessadas com muita frequência. |
| LoanModel | `date` | valor | Suporta ordenação cronológica das listagens sem sort completo em memória. |
| PaymentModel | `uuid` | único | Mesma justificativa de portabilidade. |
| PaymentModel | `loanUuid` | valor | Acelera a consulta "listar pagamentos de um empréstimo" (histórico, RF14). |
| PaymentModel | `date` | valor | Suporta ordenação cronológica do histórico de pagamentos. |

---

## Estratégia para o campo `status` (cache derivado)

Conforme a decisão **D09** (`06-decisoes.md`), o `status` de `LoanModel` é um cache de leitura, não a fonte de verdade. Ele é recalculado dentro de uma única transação Isar sempre que:

1. Um pagamento é criado.
2. Um pagamento é excluído.
3. Um empréstimo tem seu valor original alterado (cenário raro, apenas possível se ainda não houver pagamentos — RN09).

O recálculo é centralizado no `OutstandingBalanceService` (camada Application), garantindo que nenhuma tela ou repositório atualize esse campo de forma isolada.

```dart
// Pseudo-código do recálculo, executado dentro de isar.writeTxn()
final paymentsSum = await loanPayments.sum('amountInCents');
final outstandingBalance = loan.amountInCents - paymentsSum;
loan.status = outstandingBalance == 0 ? LoanStatus.paid : LoanStatus.active;
```

---

## Consultas reativas (Watchers)

O Isar permite observar coleções/queries como `Stream`. Isso é usado para:

- Atualizar a lista de pessoas automaticamente quando um saldo devedor muda (via alteração em `LoanModel`).
- Atualizar a tela de detalhe do empréstimo em tempo real ao registrar/excluir um pagamento.
- Atualizar as abas "Ativos"/"Quitados" automaticamente após qualquer operação que mude o `status`.

Essa reatividade nativa evita a necessidade de gerenciamento manual de "refresh" de tela após cada operação de escrita.

---

## Integridade referencial

Isar não impõe *foreign keys* como um SGBD relacional tradicional. A integridade é garantida na camada Application:

- Exclusão de `PersonModel` → o `LoanRepository` remove, na mesma transação, todos os `LoanModel` vinculados (e, transitivamente, seus `PaymentModel`).
- Exclusão de `LoanModel` → o `PaymentRepository` remove, na mesma transação, todos os `PaymentModel` vinculados.
- Toda operação composta (exclusão em cascata, registro de pagamento + recálculo de status) é executada dentro de uma única `isar.writeTxn()`, garantindo atomicidade.

---

## Preparação para o futuro (sincronização)

Os campos `uuid` (em vez de depender apenas do `Id` interno do Isar, que é local ao dispositivo) e os timestamps `createdAt`/`updatedAt` já preparam o schema para uma futura estratégia de sincronização (ex.: comparação de timestamps, resolução de conflitos "last write wins"), sem exigir migração de schema quando essa funcionalidade for implementada.