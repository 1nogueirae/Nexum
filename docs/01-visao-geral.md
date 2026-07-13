# 01 — Visão Geral do Projeto

## Nome do Projeto

**Nexum**

### Origem do nome

Na Roma Antiga, o *nexum* era um contrato pelo qual uma pessoa se comprometia (por vezes com o próprio corpo como garantia) em troca de um empréstimo em dinheiro. O nome remete à ideia central do produto: um vínculo formal e organizado entre quem empresta e quem deve.

## Objetivo do Produto

Nexum é um aplicativo mobile, com foco inicial em Android, para controle de **empréstimos pessoais de dinheiro** concedidos pelo usuário a outras pessoas (amigos, familiares, conhecidos). O app permite cadastrar pessoas, registrar empréstimos, lançar pagamentos (parciais ou totais) e acompanhar automaticamente o saldo devedor de cada empréstimo.

O produto nasce como **projeto pessoal de portfólio**, mas é desenhado com padrão de qualidade suficiente para uso real e contínuo no dia a dia do próprio autor.

## Problema que resolve

Controlar empréstimos informais entre pessoas costuma ser feito de forma dispersa — anotações em papel, mensagens de WhatsApp, planilhas improvisadas ou apenas memória. Isso gera:

- perda de informação sobre valores e datas;
- dificuldade em saber quanto ainda falta receber;
- ausência de histórico organizado por pessoa;
- risco de esquecimento de pagamentos já realizados.

Nexum resolve isso oferecendo um lugar único, simples e confiável para esse controle.

## Público-alvo

- Pessoa física que empresta dinheiro informalmente a terceiros (uso pessoal, não institucional).
- Usuário único por instalação (sem multiusuário, sem contas compartilhadas no MVP).

## Direção do produto (unidirecional)

Nexum registra **apenas o dinheiro que o usuário empresta a outras pessoas**. Dívidas do usuário com terceiros estão fora do escopo do MVP e de versões futuras próximas, para manter o modelo mental do app simples e evitar confusão entre "a receber" e "a pagar".

## Filosofia do Projeto

Nexum deve ser:

- **Simples** — poucas telas, poucos conceitos, zero fricção para tarefas do dia a dia.
- **Rápido** — abrir o app, registrar um pagamento e sair em poucos segundos.
- **Intuitivo** — sem necessidade de manual ou explicação.
- **Bonito** — visual cuidado, moderno, sem parecer uma planilha disfarçada de app.
- **Organizado** — informação sempre fácil de encontrar (pessoa → empréstimos → pagamentos).
- **Escalável** — arquitetura que permita crescer (ex.: sincronização em nuvem) sem reescrever o app.

### Princípio de decisão

> Sempre que houver conflito entre **simplicidade** e **quantidade de recursos**, a simplicidade vence.

Isso significa que funcionalidades "interessantes", mas não essenciais, devem ser recusadas ou adiadas deliberadamente.

## O que o Nexum NÃO é

- Não é um sistema bancário ou de gestão financeira completa.
- Não calcula juros, correção monetária ou multas.
- Não tem gamificação, IA, notificações push, nem exportações no MVP.
- Não gerencia dívidas do usuário com terceiros — apenas o que ele empresta.
- Não é multiusuário nem depende de internet para funcionar.

## Tecnologias envolvidas

| Camada | Tecnologia |
|---|---|
| Framework | React Native com Expo |
| Linguagem | TypeScript |
| Ambiente de desenvolvimento inicial | Expo Go |
| Navegação | Expo Router |
| Persistência local | SQLite via `expo-sqlite` |
| Gerenciamento de estado | Zustand |
| Backend (MVP) | Nenhum |
| Autenticação (MVP) | Nenhuma |
| Sincronização | Fora do MVP, prevista para o futuro |

## Escopo de alto nível do MVP

Cadastro de pessoas, registro de empréstimos (valor principal, sem juros), registro de pagamentos parciais e quitação total, cálculo automático de saldo devedor, histórico, busca de pessoas e visualização separada de empréstimos ativos e quitados.

Detalhamento completo em `02-requisitos.md`.

## Critério geral de sucesso do MVP

O MVP é considerado bem-sucedido quando o próprio autor consegue substituir totalmente seu controle manual de empréstimos (papel/planilha/mensagens) pelo uso diário do Nexum, sem sentir falta de nenhuma funcionalidade essencial.
