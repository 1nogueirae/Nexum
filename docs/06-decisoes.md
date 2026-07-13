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

**Consequência:** `src/app/` contém apenas rotas e layouts; componentes e regras ficam nas demais camadas.

## D08 — Persistência local com `expo-sqlite`

**Contexto:** o banco precisa funcionar offline e dentro do Expo Go.

**Decisão:** usar SQLite por meio de `expo-sqlite`, com foreign keys, migrations versionadas e transações.

**Alternativas consideradas:** armazenamento chave-valor; ORM ou banco que exija módulo nativo adicional.

**Consequências:** relacionamentos e cascatas são expressos pelo schema; consultas reativas são coordenadas pela aplicação após commits; migrations passam a ser responsabilidade explícita do projeto.

## D09 — Estado de interface com Zustand

**Decisão:** usar Zustand para estado compartilhado de tela e coordenação assíncrona, preservando hooks locais para estado não compartilhado.

**Alternativas consideradas:** somente Context API; Redux Toolkit.

**Consequência:** stores permanecem pequenas, segmentadas e sem acesso direto ao SQLite.

## D10 — Arquitetura em camadas simplificada

**Decisão:** separar Routes / Presentation / Application / Domain / Data sem criar abstrações sem uso concreto.

**Consequência:** regras de negócio não dependem de React Native ou Expo e podem ser testadas isoladamente.

## D11 — Valores monetários como inteiros em centavos

**Decisão:** valores nunca usam ponto flutuante como fonte de verdade.

**Consequência:** cálculos são determinísticos; a formatação é responsabilidade da apresentação.

## D12 — Status como cache derivado

**Decisão:** o saldo é calculado pelos pagamentos; `status` é um cache transacional para consultas rápidas.

**Consequência:** toda escrita que afete o saldo deve atualizar o status na mesma transação SQLite. O serviço central é o `OutstandingBalanceService`.

## D13 — Exclusão em cascata

**Decisão:** excluir pessoa remove empréstimos e pagamentos; excluir empréstimo remove pagamentos, sempre após confirmação.

**Consequência:** o banco usa `ON DELETE CASCADE`, e a interface informa o impacto antes da operação.

## D14 — Testes com ferramentas do ecossistema Expo

**Decisão:** usar Jest com `jest-expo` para unidades e React Native Testing Library para componentes.

**Consequência:** o domínio continua testável sem runtime nativo, e a UI é verificada pelo comportamento percebido pelo usuário.
