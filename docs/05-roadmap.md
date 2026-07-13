# 05 — Roadmap

O roadmap entrega incrementos pequenos e coesos. Nenhuma funcionalidade pós-MVP deve ser antecipada.

## v0.1 — Fundação técnica

- Inicializar o projeto React Native com Expo e TypeScript.
- Confirmar execução em dispositivo Android pelo Expo Go.
- Configurar Expo Router e a estrutura definida em `04-arquitetura.md`.
- Configurar `expo-sqlite`, migrations e schema inicial de Person, Loan e Payment.
- Criar o ponto de composição das dependências e as stores Zustand iniciais.
- Configurar lint, formatação e testes com Jest/`jest-expo`.
- Aplicar tokens básicos de cor, tipografia e espaçamento.

## v0.2 — Cadastro de Pessoas

- Lista, cadastro, edição e exclusão de pessoas.
- Validação para exclusão com empréstimos ativos.
- Pesquisa por nome.

## v0.3 — Empréstimos

- Detalhe da pessoa com seus empréstimos.
- Criação, edição e exclusão de empréstimo.
- Aplicação da RN09 e exclusão em cascata.

## v0.4 — Pagamentos e saldo devedor

- Pagamento parcial e quitação.
- Exclusão de pagamento com recálculo.
- Saldo devedor e status atualizados após cada operação.

## v0.5 — Listagens e histórico

- Filtros de empréstimos ativos e quitados.
- Histórico detalhado e cronológico de pagamentos.

## v0.6 — Home e visão consolidada

- Total emprestado ativo.
- Número de pessoas devedoras.
- Empréstimos recentes e atalhos rápidos.
- Saldo devedor por pessoa.

## v0.7 — Polimento de UX

- Estados vazios.
- Mensagens de erro conforme `10-guidelines.md`.
- Confirmações destrutivas padronizadas.
- Acessibilidade básica e responsividade em diferentes telas Android.

## v0.8 — Qualidade e testes

- Testes unitários do domínio.
- Testes de integração dos casos de uso e repositórios SQLite.
- Testes de componentes com React Native Testing Library.
- Validação de performance com massa local simulada.

## v0.9 — Release candidate

- Revisão de UI/UX contra `10-guidelines.md`.
- Ícone, splash e nome de exibição na configuração do Expo.
- Testes manuais dos fluxos de `07-fluxo.md`.
- Configuração do projeto no EAS e geração de build Android de teste.

## v1.0 — MVP completo

- Todos os requisitos do MVP implementados e estáveis.
- Build Android assinado gerado com EAS Build.
- Uso real e contínuo pelo autor.

## Pós-1.0

| Funcionalidade | Racional |
|---|---|
| Sincronização em nuvem | Backup e múltiplos dispositivos. |
| Backup/restauração manual | Evolução mais simples antes da sincronização completa. |
| Exportação PDF/Excel | Útil, mas não essencial ao controle inicial. |
| Notificações de cobrança | Exigem permissões e podem exigir development build; ficam fora do Expo Go/MVP. |
| Múltiplas moedas | Somente diante de necessidade real. |
| Juros/correção | Módulo opcional, nunca parte implícita do núcleo. |
| Múltiplos perfis | Baixa prioridade para o caso de uso principal. |
| Comprovante por foto | Melhoria posterior de UX. |
| Modo escuro | Candidato natural após validação do MVP. |

Qualquer funcionalidade que demande módulo nativo não incluído no Expo Go exige decisão explícita de migração para development build antes de ser planejada.
