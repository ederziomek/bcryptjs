# Guia Detalhado para Implantação Manual no Railway

Este guia fornecerá as instruções passo a passo para implantar o backend `fature100x-backend` permanentemente na plataforma Railway usando os arquivos que preparei para você.

## 1. Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado em seu computador local:

*   **Node.js e npm:** Necessários para executar comandos do Prisma e potencialmente para gerenciar dependências localmente. Baixe em [https://nodejs.org/](https://nodejs.org/)
*   **Git:** Necessário se você optar por implantar via GitHub/GitLab/Bitbucket. Baixe em [https://git-scm.com/](https://git-scm.com/)
*   **Railway CLI:** A ferramenta de linha de comando para interagir com o Railway. Instale com:
    ```bash
    npm install -g @railway/cli
    ```

## 2. Obter o Código Preparado

Eu preparei um pacote com todos os arquivos necessários para a implantação. Você precisará baixar este pacote (que será fornecido como um arquivo `.zip` na próxima mensagem) e descompactá-lo em um diretório no seu computador.

O pacote conterá:

*   Todo o código-fonte do backend.
*   O `Dockerfile` que define como construir a imagem da sua aplicação.
*   O arquivo `railway.toml` com configurações básicas para o Railway.
*   O `package.json` e `package-lock.json`.
*   A pasta `prisma` com o schema e as migrações.

## 3. Configuração no Railway

Siga estas etapas para configurar seu projeto no Railway:

1.  **Login no Railway:** Abra o terminal no seu computador, navegue até a pasta onde você descompactou os arquivos e execute o comando de login:
    ```bash
    railway login
    ```
    Siga as instruções para autenticar sua conta (geralmente abrindo um link no navegador).

2.  **Inicializar o Projeto Railway:** No mesmo diretório no terminal, execute:
    ```bash
    railway init
    ```
    *   Selecione seu workspace (ou crie um novo).
    *   Dê um nome ao projeto (por exemplo, `fature100x-backend-prod`).
    *   Quando perguntar sobre adicionar um serviço, você pode optar por adicionar depois ou seguir os próximos passos.

3.  **Adicionar Banco de Dados PostgreSQL:**
    *   Acesse o painel do seu projeto recém-criado no site do Railway (`https://railway.app`).
    *   Clique em `+ New` ou `Add Service`.
    *   Selecione `Database`.
    *   Escolha `PostgreSQL`.
    *   Aguarde o Railway provisionar o banco de dados. Ele terá um nome como `PostgreSQL`.

4.  **Adicionar Serviço do Backend:**
    *   **Opção A (Recomendado - Via Git):**
        *   Crie um repositório Git (por exemplo, no GitHub) para o código que você descompactou.
        *   Faça o commit e push dos arquivos para o repositório.
        *   No painel do Railway, clique em `+ New` ou `Add Service`.
        *   Selecione `GitHub Repo` (ou GitLab/Bitbucket).
        *   Configure o acesso ao seu provedor Git, se ainda não o fez.
        *   Selecione o repositório que você acabou de criar.
        *   O Railway detectará o `Dockerfile` e o `railway.toml` e configurará o serviço automaticamente.
    *   **Opção B (Via CLI - `railway up`):**
        *   No terminal, no diretório do projeto, execute:
            ```bash
            railway up
            ```
        *   Este comando fará o upload dos arquivos locais e iniciará a implantação. O Railway usará o `Dockerfile` para construir a imagem.

## 4. Configuração de Variáveis de Ambiente

Após adicionar o serviço do backend (seja via Git ou `railway up`), você precisa configurar as variáveis de ambiente:

1.  **Acesse as Configurações do Serviço:** No painel do Railway, clique no serviço do backend que foi criado (geralmente terá o nome do repositório ou `app`).
2.  **Vá para a Aba `Variables`:**
3.  **Adicione as Seguintes Variáveis:**
    *   `DATABASE_URL`: Clique no botão para adicionar uma variável referenciada. O Railway deve sugerir a variável `DATABASE_URL` do seu serviço PostgreSQL. Selecione-a.
    *   `ADMIN_EMAIL`: Defina o email do administrador (ex: `admin@prod.com`).
    *   `ADMIN_INITIAL_PASSWORD`: Defina uma senha segura para o administrador inicial.
    *   `ADMIN_COOKIE_PASSWORD`: Gere uma string aleatória e segura para esta variável (ex: usando um gerador de senhas).
    *   `ADMIN_SESSION_SECRET`: Gere outra string aleatória e segura para esta variável.
    *   `NODE_ENV`: Defina como `production`.
    *   `PORT`: O Railway geralmente define isso automaticamente. Se o serviço não iniciar, verifique se ele está usando a porta correta (3001, conforme definido no Dockerfile). Você pode definir `PORT=3001` se necessário, mas geralmente não é preciso.

## 5. Implantação e Migrações

1.  **Aguarde a Implantação:** Se você usou a Opção A (Git), o Railway iniciará a construção e implantação automaticamente após você configurar o serviço. Se usou a Opção B (`railway up`), a implantação já deve ter começado. Monitore o progresso na aba `Deployments` do serviço.

2.  **Executar Migrações do Prisma:** Após a primeira implantação bem-sucedida do backend, você precisa aplicar as migrações do banco de dados. No terminal, no diretório do projeto, execute:
    ```bash
    railway run npx prisma migrate deploy
    ```
    Isso executará o comando de migração no ambiente de produção do Railway, configurando as tabelas no banco de dados PostgreSQL.

## 6. Acessando a Aplicação

1.  **Encontre o Domínio Público:** No painel do Railway, vá para as configurações do serviço do backend.
2.  Na aba `Settings`, procure pela seção `Networking` ou `Domains`.
3.  O Railway fornecerá um domínio público padrão no formato `xxxx.up.railway.app`.
4.  Você pode acessar seu backend e o painel AdminJS (no caminho `/admin`) através deste domínio.
5.  **Domínio Personalizado (Opcional):** Você pode configurar um domínio personalizado (ex: `api.seusite.com`) nesta mesma seção, seguindo as instruções do Railway para apontar seu DNS.

## 7. Solução de Problemas

*   **Logs:** Verifique os logs de build e de execução na aba `Deployments` ou `Logs` do serviço no painel do Railway para identificar erros.
*   **Variáveis de Ambiente:** Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente e que a `DATABASE_URL` está vinculada corretamente ao serviço PostgreSQL.
*   **Migrações:** Confirme se as migrações do Prisma foram executadas com sucesso após a implantação.
*   **Porta:** Verifique se a aplicação está tentando ouvir na porta correta (o Railway geralmente gerencia isso via variável `PORT`).

Se encontrar problemas, a documentação do Railway ([https://docs.railway.app/](https://docs.railway.app/)) e a comunidade podem ser úteis.

Boa sorte com a implantação!
