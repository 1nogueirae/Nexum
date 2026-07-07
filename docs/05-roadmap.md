# 05 — Roadmap

O roadmap segue o princípio de simplicidade do Nexum: cada versão entrega um incremento pequeno e coeso, evitando acumular funcionalidades não essenciais antes de validar o uso real do MVP.

## v0.1 — Fundação técnica

Objetivo: ter a base do projeto rodando, sem telas finais.

- Setup do projeto Flutter.
- Configuração do Isar e schemas iniciais (Person, Loan, Payment).
- Estrutura de pastas definida em `04-arquitetura.md`.
- Tema base (cores, tipografia) aplicado a um `MaterialApp` vazio.
- Configuração de Riverpod na árvore de widgets.

## v0.2 — Cadastro de Pessoas

- Tela de lista de pessoas.
- Cadastrar pessoa.
- Editar pessoa.
- Excluir pessoa (com validação de empréstimos ativos).
- Busca de pessoas por nome.

## v0.3 — Empréstimos

- Tela de detalhe da pessoa (com lista de empréstimos).
- Criar empréstimo vinculado a uma pessoa.
- Editar empréstimo (respeitando RN09).
- Excluir empréstimo (cascata de pagamentos).

## v0.4 — Pagamentos e saldo devedor

- Registrar pagamento parcial.
- Quitar empréstimo (ação de conveniência).
- Excluir pagamento com recálculo automático.
- Cálculo e exibição do saldo devedor em tempo real.

## v0.5 — Listagens e histórico

- Aba/filtro de empréstimos ativos.
- Aba/filtro de empréstimos quitados.
- Tela de histórico detalhado do empréstimo (linha do tempo de pagamentos).

## v0.6 — Home e visão consolidada

- Tela inicial (Home) com resumo: total emprestado ativo, número de pessoas devedoras, atalhos rápidos.
- Indicador de saldo devedor por pessoa na lista.

## v0.7 — Polimento de UX

- Estados vazios (nenhuma pessoa, nenhum empréstimo, nenhum pagamento).
- Mensagens de erro padronizadas (ver `10-ui-guidelines.md`).
- Confirmação de exclusão padronizada em todas as telas.
- Ajustes de responsividade para diferentes tamanhos de tela Android.

## v0.8 — Qualidade e testes

- Testes unitários das regras de domínio (cálculo de saldo, validações de pagamento).
- Testes de integração dos casos de uso principais.
- Revisão de performance em bases maiores (ex.: 1.000+ empréstimos simulados).

## v0.9 — Release candidate

- Revisão geral de UI/UX contra `10-ui-guidelines.md`.
- Ícone do app, splash screen, nome final de exibição.
- Testes manuais completos de todos os fluxos (`07-fluxos.md`).
- Preparação de build de release assinado.

## v1.0 — MVP completo

- Todas as funcionalidades do escopo do MVP (ver `02-requisitos.md`) implementadas, testadas e estáveis.
- Uso real e contínuo pelo autor no dia a dia.

---

## Funcionalidades de versões futuras (pós-1.0)

Fora do MVP, mas mantidas no radar para não serem esquecidas — **nenhuma delas deve ser antecipada durante o desenvolvimento do MVP**:

| Funcionalidade | Racional |
|---|---|
| Sincronização em nuvem | Permitir backup e uso em múltiplos dispositivos. |
| Backup/restauração manual (arquivo local) | Passo intermediário mais simples que sincronização completa, útil antes dela. |
| Exportação de relatórios (PDF/Excel) | Adiado deliberadamente do MVP; útil para compartilhar comprovantes. |
| Notificações/lembretes de cobrança | Adiado deliberadamente; exige lidar com permissões e agendamento no Android. |
| Múltiplas moedas | Só se houver necessidade real (uso internacional). |
| Suporte a juros/correção monetária (opcional, configurável) | Manter fora do núcleo — se implementado, seria um módulo opt-in, nunca padrão. |
| Múltiplos usuários / perfis no mesmo dispositivo | Baixa prioridade, não é o caso de uso principal. |
| Anexar comprovante (foto) ao pagamento | Melhoria de UX, mas não essencial ao controle financeiro em si. |
| Modo escuro (dark theme) | Melhoria de UX, candidata natural para logo após o v1.0. |