# Nexum

Gerencie empréstimos pessoais de forma simples, organizada e transparente.

Aplicativo mobile offline-first planejado em **React Native**, **TypeScript** e **Expo**, com desenvolvimento inicial pelo **Expo Go**.

## Estado do projeto

O repositório contém, neste momento, apenas a documentação de produto e o planejamento técnico. O código da aplicação será iniciado separadamente, seguindo a arquitetura descrita em [`docs/04-arquitetura.md`](docs/04-arquitetura.md).

## Documentação

- [Visão geral](docs/01-visao-geral.md)
- [Requisitos](docs/02-requisitos.md)
- [Modelo de domínio](docs/03-modelo-de-dominio.md)
- [Arquitetura](docs/04-arquitetura.md)
- [Roadmap](docs/05-roadmap.md)
- [Decisões](docs/06-decisoes.md)
- [Fluxos de usuário](docs/07-fluxo.md)
- [Wireframes](docs/08-wireframes.md)
- [Banco de dados local](docs/09-banco.md)
- [Diretrizes de interface](docs/10-guidelines.md)

## Como rodar o aplicativo (Emulador Android)

Para rodar o aplicativo localmente em um emulador Android, siga os passos abaixo:

### 1. Preparando o Ambiente
1. Instale o [Android Studio](https://developer.android.com/studio).
2. Instale o [Node.js](https://nodejs.org/) (versão LTS recomendada).
3. Clone este repositório e instale as dependências executando `npm install` na pasta do projeto.

### 2. Configurando o Android Virtual Device (AVD)
1. Abra o **Android Studio**.
2. Na tela inicial, clique em **More Actions** e selecione **Virtual Device Manager**.
3. Clique no botão **Create Virtual Device**.
4. Escolha um perfil de hardware (por exemplo, **Medium Phone**) e clique em **Next**.
5. Na aba **Recommended**, selecione uma imagem de sistema (ex: **API 29** ou superior) e faça o download caso ainda não a tenha baixado. Clique em **Next**.
6. Dê um nome ao seu AVD (opcional). Clique em **Show Advanced Settings** e certifique-se de que o dispositivo possui pelo menos:
   - **RAM:** 2048 MB (2 GB) ou superior
   - **Internal Storage:** 2048 MB (2 GB) ou superior
7. Clique em **Finish**.
8. Inicie o emulador clicando no botão de **Play** (triângulo verde) na lista de dispositivos do Virtual Device Manager.

### 3. Executando o Projeto
Com o emulador aberto e rodando:
1. Abra o terminal na pasta raiz do projeto.
2. Execute o comando para iniciar o servidor do Expo:
   ```bash
   npm start
   ```
3. No terminal onde o Expo está rodando, pressione a tecla `a` para abrir o aplicativo no emulador Android.
4. O Expo Go (ou o app nativo caso esteja utilizando prebuild) será instalado automaticamente no emulador e o aplicativo será carregado.
