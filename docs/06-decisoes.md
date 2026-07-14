# 06 — Decisões (ADR resumido)

Este documento registra as decisões vigentes do Nexum. Decisões substituídas não devem continuar orientando a implementação.

## D01 — Empréstimos sem juros

**Decisão:** o saldo devedor é sempre `valor emprestado − soma de pagamentos`.

**Consequência:** juros, correção e multas não fazem parte do núcleo do domínio.

## D02 — Direção única do empréstimo

**Decisão:** o Nexum registra apenas dinheiro emprestado pelo usuário a terceiros.

**Consequência:** a experiência responde sempre a “quem me deve e quanto”, sem misturar contas a pagar.

## D03 — Moeda fixa em BRL

**Decisão:** não há seleção ou conversão de moeda no MVP.

**Consequência:** valores são inteiros em centavos e a apresentação usa o formato brasileiro.

## D04 — MVP local, sem backend e sem autenticação

**Decisão:** dados ficam somente no dispositivo durante o MVP.

**Consequência:** o app funciona offline e sincronização será uma evolução independente.

## D05 — React Native com Expo e TypeScript

**Contexto:** a fundação técnica anterior foi abandonada antes do desenvolvimento do produto.

**Decisão:** usar React Native gerenciado pelo Expo, com TypeScript em modo estrito.

**Alternativas consideradas:** React Native CLI com projetos nativos mantidos manualmente; outras soluções mobile multiplataforma.

**Consequências:** o código de produto será TypeScript; a configuração nativa será administrada pelo Expo; os artefatos técnicos anteriores deixam de fazer parte do projeto.

## D06 — Expo Go no desenvolvimento inicial

**Decisão:** o MVP deve executar no Expo Go durante o desenvolvimento.

**Consequências:** dependências com código nativo customizado ficam proibidas enquanto essa decisão vigorar. O Expo Go não substitui builds instaláveis ou de produção, que serão gerados com EAS Build. Uma futura migração para development build exige novo ADR.

## D07 — Navegação com Expo Router

**Decisão:** usar rotas baseadas em arquivos com Expo Router.

**Consequência:** `src/app/` contém rotas e layouts; componentes reutilizáveis e regras ficam fora dessa pasta.

## D08 — Persistência local com `expo-sqlite`

**Contexto:** o banco precisa funcionar offline e dentro do Expo Go.

**Decisão:** usar SQLite por meio de `expo-sqlite`, com foreign keys, migrations versionadas e transações.

**Alternativas consideradas:** armazenamento chave-valor; ORM ou banco que exija módulo nativo adicional.

**Consequências:** relacionamentos e cascatas são expressos pelo schema; a interface recarrega os dados afetados após escritas; migrations passam a ser responsabilidade explícita do projeto.

## D09 — Estado local antes de estado global

**Decisão:** usar hooks do React para o estado das telas e componentes. Uma biblioteca de estado compartilhado só será adicionada quando uma necessidade concreta não puder ser atendida de forma simples.

**Alternativas consideradas:** Zustand; Context API; Redux Toolkit.

**Consequência:** o projeto não mantém stores, Providers ou hooks globais antecipadamente.

## D10 — Organização por funcionalidades

**Decisão:** organizar o código em rotas, componentes, banco e funcionalidades. Cada funcionalidade separa suas regras públicas do SQL quando ambos existirem.

**Consequência:** o fluxo entre tela, regra e persistência fica visível, e novas pastas ou abstrações só são criadas quando resolvem um problema existente.

## D11 — Valores monetários como inteiros em centavos

**Decisão:** valores nunca usam ponto flutuante como fonte de verdade.

**Consequência:** cálculos são determinísticos; a formatação é responsabilidade da apresentação.

## D12 — Status como cache derivado

**Decisão:** o saldo é calculado pelos pagamentos; `status` é um cache transacional para consultas rápidas.

**Consequência:** toda escrita que afete o saldo deve atualizar o status na mesma transação SQLite. A função responsável será criada junto da funcionalidade de empréstimos.

## D13 — Exclusão em cascata

**Decisão:** excluir pessoa remove empréstimos e pagamentos; excluir empréstimo remove pagamentos, sempre após confirmação.

**Consequência:** o banco usa `ON DELETE CASCADE`, e a interface informa o impacto antes da operação.

## D14 — Testes com ferramentas do ecossistema Expo

**Decisão:** usar Jest com `jest-expo` para unidades e React Native Testing Library para componentes.

**Consequência:** regras em TypeScript podem ser testadas isoladamente, e a UI é verificada pelo comportamento percebido pelo usuário.
