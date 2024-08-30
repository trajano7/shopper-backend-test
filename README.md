# Teste Desenvolvimento Web Shopper (BackEnd)

## Sobre

Este projeto é um serviço de backend desenvolvido para a Shopper.com.br como parte de um teste técnico para a vaga de desenvolvedor web. O objetivo do serviço é gerenciar a leitura individualizada de consumo de água e gás utilizando inteligência artificial para obter medições precisas através de fotos dos medidores.

O backend do serviço foi desenvolvido utilizando Node.js com TypeScript.  O serviço também faz integração com a API do Google Gemini para processar imagens e extrair os dados de consumo. Além disso, o projeto é completamente dockerizado, permitindo fácil configuração e execução em qualquer ambiente.

Os principais recursos incluem:

+ Upload de imagens para leitura de consumo.
+ Confirmação e correção dos valores lidos.
+ Listagem das medidas realizadas para cada cliente.

## Tecnologias Utilizadas

- Node.js
- Express
- MySQL
- Docker
- Docker Compose

## Pré-requisitos

Antes de iniciar, certifique-se de ter o seguinte instalado:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Instalação

1. **Clone o repositório:**

    ```bash
    git clone https://github.com/trajano7/shopper-backend-test.git
    cd shopper-backend-test
    ```

2. **Configurar as variáveis de ambiente:**

    Para utilizar a API do Google Gemini, é necessário criar um arquivo .env na raiz do projeto com o seguinte conteúdo:

    ```env
    GEMINI_API_KEY=<Sua_Chave_da_API_Gemini>
    ```

    Você pode obter sua chave aqui: [Documentação da API do Google ](https://ai.google.dev/gemini-api/docs/api-key)

## Uso

1. **Construir a imagem Docker**

    Execute o comando abaixo na raiz do projeto para construir a imagem Docker do projeto. Certifique-se de que você está no diretório correto onde o `Dockerfile` está localizado.

    ```bash
    docker build -t shopper-backend-test .
    ```

2. **Iniciar o container Docker**

    Execute o comando abaixo para iniciar o container Docker na raiz do projeto. Certifique-se de estar no diretório onde o `docker-compose.yml` está localizado.

    ```bash
    docker compose up
    ```

3. **Acessar a aplicação:**

    Após a execução, a aplicação estará disponível em `http://localhost:3000`.


## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.