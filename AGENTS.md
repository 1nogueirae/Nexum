# AGENTS.md — Guia de Referência do Agente de IA (Nexum)

Este documento serve como a **fonte primária de contexto e instrução para Agentes de IA** atuando no desenvolvimento do projeto **Nexum**. Qualquer implementação de código, refatoração ou adição de funcionalidade DEVE respeitar rigorosamente as diretrizes aqui consolidadas.

---

## 1. 📌 Visão Geral & Filosofia do Produto

- **O que é o Nexum**: Aplicativo mobile offline-first para controle pessoal de **dinheiro emprestado pelo usuário a terceiros**.
- **Direção Única**: O app registra **somente a receber**. Dívidas do próprio usuário com terceiros estão fora do escopo.
- **Público**: Usuário único por instalação (sem multiusuário, sem login, sem backend no MVP).
- **Princípio Fundamental de Decisão**:
  > *Sempre que houver conflito entre **simplicidade** e **quantidade de recursos**, a simplicidade vence.*
- **O que o Nexum NÃO faz**: Sem juros, sem correção monetária, sem exportações, sem notificações push, sem sincronização remota no MVP.

---

## 2. 🛠️ Stack Técnica & Restrições

| Camada / Requisito | Escolha Técnica |
|---|---|
| Framework Mobile | React Native com Expo (Managed Workflow) |
| Cliente de Dev | **Expo Go** (restrição rígida para o MVP) |
| Linguagem | TypeScript em modo estrito (`strict: true`) |
| Navegação | Expo Router (rotas baseadas em arquivos em `src/app`) |
| Banco de Dados | SQLite local via `expo-sqlite` |
| Estado de UI | Hooks nativos do React (`useState`, `useEffect`, `useMemo`) |
| Testes | Jest, `jest-expo`, React Native Testing Library |
| Build / Release | EAS Build (Android AVD / APK / AAB) |

### ⚠️ Limites do Expo Go (Muito Importante)
- **Proibido** adicionar bibliotecas nativas que exijam modificação das pastas `android/` ou `ios/`.
- **Proibido** manter ou editar arquivos em `android/` e `ios/`.
- Toda nova dependência npm deve ser testada e compatível com o **Expo Go SDK**.

---

## 3. 📂 Estrutura de Arquivos & Padrão de Organização

```text
src/
├── app/                         # Rotas e Layouts (Expo Router)
│   ├── _layout.tsx              # SQLiteProvider, fontes e tema global
│   └── (tabs)/                  # Abas principais (Home, Pessoas, Ativos, Quitados)
│       ├── _layout.tsx
│       ├── index.tsx            # Home / Visão Geral
│       ├── pessoas.tsx          # Lista / Busca de Pessoas
│       ├── ativos.tsx           # Empréstimos Ativos (saldo > 0)
│       └── quitados.tsx         # Empréstimos Quitados (saldo == 0)
├── components/                  # Componentes reutilizáveis (Cards, Inputs, Buttons)
├── database/                    # Configuração SQLite, schema e migrations
│   ├── connection.ts            # Inicialização e Pragmas (FOREIGN KEYS = ON, WAL)
│   ├── schema.ts                # DDL das tabelas
│   └── migrations/              # Arquivos SQL incrementais de migração
├── features/                    # Módulos por funcionalidade
│   └── people/                  # Exemplo de funcionalidade (Pessoas)
│       ├── people.ts            # Tipos, schemas de validação e ações públicas
│       └── people-database.ts   # Funções de acesso direto ao SQLite
├── money.ts                     # Classe Money (manipulação em centavos)
├── theme.ts                     # Design Tokens (cores, espaçamentos, tipografia)
└── utils.ts                     # Utilitários puros (ex: getInitials, clearName)
```

### Regras de Separação de Responsabilidades:
1. **Telas / Rotas (`src/app/`)**: Consomem os hooks da funcionalidade e mantêm apenas estado visual temporário (`loading`, `error`, `searchQuery`).
2. **Camada de Lógica (`src/features/<nome>/<nome>.ts`)**: Exporta tipos, funções de alto nível e validações.
3. **Camada de Dados (`src/features/<nome>/<nome>-database.ts`)**: Isola todas as queries e comandos SQL. **NUNCA escreva SQL dentro de componentes de UI**.
4. **Novas Abstrações**: Só crie pastas ou arquivos quando houver uso concreto imediato.

---

## 4. 🗃️ Modelo de Domínio & Banco de Dados

### Diagrama Entidade-Relacionamento
- `Person` `(1)` ─── `<possui>` ─── `(N)` `Loan` `(1)` ─── `<recebe>` ─── `(N)` `Payment`

### Entidades e Schemas (SQLite)

#### 1. `people`
- `id` (TEXT, PK, UUID)
- `name` (TEXT, NOT NULL) — Busca com `COLLATE NOCASE`.
- `phone` (TEXT, NULL)
- `note` (TEXT, NULL)
- `created_at` (TEXT, ISO 8601 UTC)
- `updated_at` (TEXT, ISO 8601 UTC)

#### 2. `loans`
- `id` (TEXT, PK, UUID)
- `person_id` (TEXT, FK -> `people.id` `ON DELETE CASCADE`)
- `amount_in_cents` (INTEGER, > 0) — Valor original em centavos.
- `description` (TEXT, NULL)
- `date` (TEXT, ISO 8601)
- `status` (TEXT, `'active'` | `'paid'`) — Cache de leitura derivado do saldo.
- `created_at` (TEXT, ISO 8601 UTC)
- `updated_at` (TEXT, ISO 8601 UTC)

#### 3. `payments`
- `id` (TEXT, PK, UUID)
- `loan_id` (TEXT, FK -> `loans.id` `ON DELETE CASCADE`)
- `amount_in_cents` (INTEGER, > 0) — Valor pago em centavos.
- `date` (TEXT, ISO 8601)
- `note` (TEXT, NULL)
- `created_at` (TEXT, ISO 8601 UTC)

### Invariantes e Cálculos Fundamentais
- **Saldo Devedor**: `outstandingBalance = amount_in_cents - sum(payments.amount_in_cents)`.
- **Status Derivado**:
  - `outstandingBalance > 0` ⇒ `status = 'active'`
  - `outstandingBalance == 0` ⇒ `status = 'paid'`
- **Atomicidade**: Toda alteração em `payments` que altere o saldo de um empréstimo DEVE atualizar a coluna `loans.status` e `loans.updated_at` **na mesma transação SQLite**.

---

## 5. 💲 Manipulação de Valores Monetários

- **Regra de Ouro**: **NUNCA utilize números de ponto flutuante (`float`/`double`) para calcular saldos ou valores monetários**.
- Utilize sempre a classe `Money` (`src/money.ts`).
- Valores são persistidos e trafegados inteiramente em **centavos** (`integer`).
- A formatação para exibição (`R$ 1.234,56`) só ocorre na camada de apresentação/renderização usando `Money.format()`.

---

## 6. 📜 Regras de Negócio (RN01 - RN13)

| ID | Regra | Impacto Técnico |
|---|---|---|
| **RN01** | Um empréstimo pertence a exatamente uma pessoa. | FK `person_id` obrigatória. |
| **RN02** | Um empréstimo possui zero ou mais pagamentos. | FK `loan_id` em `payments`. |
| **RN03** | Saldo devedor = `valor_emprestado - sum(pagamentos)`. | Cálculo dinâmico em query/função. |
| **RN04** | Saldo = 0 indica empréstimo **quitado**. | `status = 'paid'`. |
| **RN05** | Saldo > 0 indica empréstimo **ativo**. | `status = 'active'`. |
| **RN06** | Não é permitido pagamento com valor ≤ 0. | Validação `amount_in_cents > 0`. |
| **RN07** | Não é permitido pagamento superior ao saldo devedor atual. | Validação transacional: `soma(pagamentos) + novo <= valor_original`. |
| **RN08** | "Quitar Empréstimo" gera pagamento automático igual ao saldo restante. | Operação de conveniência em lote na transação. |
| **RN09** | Alterar valor original de empréstimo é **proibido se já houver pagamentos**. | Travar edição de `amount_in_cents` quando `count(payments) > 0`. |
| **RN10** | Excluir pessoa com saldo ativo exige confirmação informando o total. | Alerta visual na UI exibindo o total devedor envolvido. |
| **RN11** | Exclusão de pessoa/empréstimo limpa em cascata no banco. | `ON DELETE CASCADE` configurado no SQLite. |
| **RN12** | Excluir pagamento recalcula imediatamente saldo e status do empréstimo. | Executar recálculo na transação de deleção. |
| **RN13** | Todo valor monetário é um inteiro em centavos. | Manipulação via `src/money.ts`. |

---

## 7. 🎨 UI/UX & Design System

- **Paleta Principais** (`src/theme.ts`):
  - Primária: `#2F6F5E` (verde-petróleo)
  - Superfície: `#FFFFFF` / Fundo: `#F7F7F5`
  - Sucesso/Quitado: `#3E8E5A`
  - Erro/Alerta: `#B3261E`
- **Tipografia**: Sistema Inter. Valores monetários sempre possuem peso `Medium` (500) ou `SemiBold` (600).
- **Ações Primárias**: No máximo **1 ação primária em destaque por tela** (ex: FAB `+`).
- **Navegação**: Máximo de **3 toques** a partir da Home para cadastrar pessoa ou registrar pagamento.
- **Erros Visualizados**: Validação inline abaixo dos campos. Erros genéricos de pop-up são proibidos para falhas de validação.

---

## 8. 🛑 Diretrizes Rígidas para o Agente de IA

Ao ser solicitado para gerar, alterar ou refatorar código neste repositório, você DEVE seguir estas regras:

1. **Respeitar os Limites de Camadas**: Não misture consultas SQL com JSX/React Native components.
2. **Sem Estado Global Prematuro**: Não instale Zustand, Redux ou crie Context Providers a menos que haja um ADR aprovado.
3. **Gerenciamento de SQLite**: Use sempre `useSQLiteContext()` da biblioteca `expo-sqlite`. Habilite `PRAGMA foreign_keys = ON;`.
4. **Migrations Imutáveis**: Nunca modifique arquivos SQL já existentes dentro de `src/database/migrations/`. Para alterar o banco, crie uma nova migration com a versão incremental seguinte.
5. **Manter Tipagem Estrita**: NUNCA utilize o tipo `any`. Defina interfaces/tipos em TypeScript para todas as entradas e saídas.
6. **Integridade de Documentação**: Preserve os comentários explicativos e docstrings. Se atualizar uma regra de negócio, certifique-se de atualizar também os testes associados em `__tests__/` ou `jest`.

---

## 9. 📚 Links Rápidos para a Documentação Oficial

Para detalhes adicionais sobre o produto e decisões de arquitetura, consulte a pasta `docs/`:

- [`docs/01-visao-geral.md`](file:///C:/Repositories/Nexum/docs/01-visao-geral.md) — Visão geral e escopo do MVP.
- [`docs/02-requisitos.md`](file:///C:/Repositories/Nexum/docs/02-requisitos.md) — Lista completa de RFs, RNFs e Regras de Negócio.
- [`docs/03-modelo-de-dominio.md`](file:///C:/Repositories/Nexum/docs/03-modelo-de-dominio.md) — Detalhamento das entidades Person, Loan e Payment.
- [`docs/04-arquitetura.md`](file:///C:/Repositories/Nexum/docs/04-arquitetura.md) — Organização técnica, Expo Router e SQLite.
- [`docs/05-roadmap.md`](file:///C:/Repositories/Nexum/docs/05-roadmap.md) — Fases de desenvolvimento.
- [`docs/06-decisoes.md`](file:///C:/Repositories/Nexum/docs/06-decisoes.md) — ADRs do projeto (D01 a D14).
- [`docs/07-fluxo.md`](file:///C:/Repositories/Nexum/docs/07-fluxo.md) — Fluxos de navegação e telas.
- [`docs/08-wireframes.md`](file:///C:/Repositories/Nexum/docs/08-wireframes.md) — Leiaute e estrutura visual das telas.
- [`docs/09-banco.md`](file:///C:/Repositories/Nexum/docs/09-banco.md) — Schema SQLite, índices, DDL e estrátegias de cache.
- [`docs/10-guidelines.md`](file:///C:/Repositories/Nexum/docs/10-guidelines.md) — Guia de estilo UI/UX, tokens e acessibilidade.
