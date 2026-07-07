# 10 — Diretrizes de Interface (UI/UX)

## Princípios de UX

1. **Uma ação primária por tela.** Cada tela tem um botão/ação de destaque óbvia (ex.: "Salvar", "+ Novo Empréstimo"); demais ações ficam secundárias (menu de overflow `⋮`).
2. **Nada de fricção desnecessária.** Nenhum fluxo essencial (registrar pagamento, cadastrar pessoa) deve exigir mais de 3 toques a partir da Home (RNF02).
3. **Feedback imediato.** Toda ação de escrita (salvar, excluir, pagar) reflete instantaneamente na tela seguinte — sem necessidade de "puxar para atualizar".
4. **Confirmação apenas quando destrutivo ou irreversível.** Exclusões sempre pedem confirmação; edições e criações, não.
5. **Números sempre em destaque.** Valores monetários (saldo devedor, valor emprestado) recebem maior peso visual (tipografia maior/mais forte) do que textos descritivos, pois são a informação mais consultada.
6. **Transparência do estado do dado.** O usuário deve sempre entender, sem precisar calcular mentalmente, quanto ainda é devido — o saldo devedor é sempre mostrado, nunca apenas o valor original.

## Cores

Paleta neutra com um único tom de destaque, evitando a aparência "colorida demais" de apps financeiros genéricos.

| Papel | Cor | Uso |
|---|---|---|
| Primária | `#2F6F5E` (verde-petróleo) | Botões de ação primária, ícones ativos, saldo devedor > 0. |
| Primária (variante escura) | `#1F4E42` | Estado pressionado, app bar. |
| Neutro — fundo | `#F7F7F5` | Fundo padrão das telas (modo claro). |
| Neutro — superfície | `#FFFFFF` | Cards, formulários. |
| Neutro — texto principal | `#1C1C1C` | Textos primários. |
| Neutro — texto secundário | `#6B6B6B` | Legendas, datas, textos auxiliares. |
| Sucesso / Quitado | `#3E8E5A` | Status "quitado", confirmações. |
| Alerta / Erro | `#B3261E` | Mensagens de erro, ações destrutivas (excluir). |
| Divisor | `#E3E3E0` | Linhas de separação entre itens de lista. |

**Justificativa:** uma paleta reduzida e de baixa saturação transmite seriedade e confiabilidade (adequado a um app que lida com dinheiro emprestado entre pessoas), reservando cor mais viva apenas para ações e estados que realmente precisam de destaque.

## Tipografia

- Fonte: **Inter** (ou a fonte padrão do sistema, `Roboto`, como fallback) — ambas têm excelente legibilidade em números, o que é central para este app.
- Escala tipográfica sugerida:

| Estilo | Tamanho | Peso | Uso |
|---|---|---|---|
| Display | 28sp | Bold | Valor de destaque (ex.: saldo devedor total na Home). |
| Título | 20sp | SemiBold | Títulos de tela (app bar). |
| Subtítulo | 16sp | Medium | Nomes de pessoas, títulos de card. |
| Corpo | 14sp | Regular | Textos descritivos, observações. |
| Legenda | 12sp | Regular | Datas, textos auxiliares, labels de campo. |

- Valores monetários sempre em peso **Medium/SemiBold**, nunca Regular, para reforçar sua importância visual mesmo em listas densas.

## Espaçamentos

Sistema de espaçamento em múltiplos de 4dp, para consistência entre telas:

| Token | Valor | Uso |
|---|---|---|
| `spacing.xs` | 4dp | Espaço entre ícone e texto adjacente. |
| `spacing.sm` | 8dp | Espaço entre elementos relacionados dentro de um card. |
| `spacing.md` | 16dp | Padding padrão de cards e telas (margem lateral). |
| `spacing.lg` | 24dp | Separação entre seções distintas de uma tela. |
| `spacing.xl` | 32dp | Espaço acima/abaixo de estados vazios e telas de destaque (Home). |

## Componentes

- **Cards de lista** (pessoa, empréstimo, pagamento): fundo branco, cantos arredondados (12dp), leve elevação (shadow sutil), padding `spacing.md`.
- **Botão primário**: preenchido, cor primária, cantos arredondados (8dp), altura mínima de 48dp (área de toque acessível).
- **Botão secundário/terciário**: apenas texto ou outline, usado para ações como "Cancelar".
- **Botão de ação flutuante (FAB)**: usado apenas para a ação de criação mais importante da tela (ex.: "+ Nova Pessoa", "+ Novo Empréstimo"). Nunca mais de um FAB por tela.
- **Chips de status**: pequenas etiquetas coloridas ("Ativo" em verde-petróleo, "Quitado" em verde-sucesso) usadas em listas de empréstimos.
- **Abas (tabs)**: usadas para alternar entre "Ativos" e "Quitados", sempre com a aba "Ativos" como padrão ao abrir a tela.
- **Campos de formulário**: outline simples, label flutuante, mensagem de erro exibida abaixo do campo em vermelho (`#B3261E`) quando houver validação falha.

## Consistência visual

- Todas as telas de formulário (Pessoa, Empréstimo, Pagamento) seguem o mesmo layout: app bar com botão "voltar" à esquerda e ação "Salvar" à direita, campos empilhados verticalmente, botão de submit sempre no app bar (não flutuando no rodapé), para reduzir a variação de padrões entre telas.
- Todas as listas (pessoas, empréstimos, pagamentos) usam o mesmo componente de card-lista, garantindo familiaridade entre telas.
- Ícones seguem um único set consistente (ex.: Material Symbols), sem misturar estilos de ícone (outline vs. filled) na mesma tela.
- Todas as datas seguem o formato `dd/mm/aaaa`; todos os valores seguem o formato `R$ 0.000,00` (RNF10).

## Estados vazios

Cada lista possui um estado vazio dedicado, com:
1. Uma ilustração simples ou ícone (não fotografia).
2. Uma frase curta e direta explicando a ausência de dados.
3. Uma chamada para ação, quando aplicável (ex.: "Toque em + para cadastrar sua primeira pessoa").

| Tela | Mensagem sugerida |
|---|---|
| Lista de Pessoas (nenhuma pessoa) | "Nenhuma pessoa cadastrada ainda. Toque em '+' para começar." |
| Busca sem resultado | "Nenhuma pessoa encontrada para '{termo}'." |
| Empréstimos ativos (vazio) | "Nenhum empréstimo ativo no momento." |
| Empréstimos quitados (vazio) | "Nenhum empréstimo quitado ainda." |
| Histórico de pagamentos (vazio) | "Nenhum pagamento registrado para este empréstimo." |

## Mensagens de erro

Princípios:
- Sempre explicar **o motivo** e, quando possível, **o que fazer** — nunca um erro genérico tipo "Erro ao salvar".
- Erros de validação de campo aparecem **inline**, abaixo do campo correspondente.
- Erros de regra de negócio (ex.: pagamento maior que saldo devedor) aparecem como mensagem inline no formulário, próximos ao campo relevante — não como pop-up genérico.

| Cenário | Mensagem sugerida |
|---|---|
| Nome de pessoa vazio | "Informe um nome para continuar." |
| Valor de empréstimo ≤ 0 | "O valor do empréstimo deve ser maior que zero." |
| Valor de pagamento ≤ 0 | "O valor do pagamento deve ser maior que zero." |
| Pagamento maior que saldo devedor | "O valor informado (R$ X) é maior que o saldo devedor atual (R$ Y)." |
| Exclusão de pessoa com empréstimos ativos | "{Nome} possui R$ X em empréstimos ativos. Excluir também removerá esse histórico permanentemente." |
| Falha inesperada de persistência | "Não foi possível salvar. Tente novamente." (mensagem genérica reservada apenas para falhas técnicas reais, não de validação) |