# CrowProject
Javascript library for performance monitor on distributed systems

## Instruções
Clone o repositório em seu computador:
`git clone https://github.com/JohnathanALves/CrowProject.git`

Dentro dos diretórios ./client e ./server rode o comando:
`npm install`

Você está pronto para construir as imagens

### Build servidor:
Dentro da pasta server
`docker build -t node-server .`

### Build cliente:
Dentro da pasta cliente
`docker build -t node-client .`

### Executando o projeto:
Primeiro instancie um servidor
`docker run -it --rm -v <CAMINHO_ABSOLUTO_PARA_A_PASTA_SERVER/SRC>:/app/src node-server`
Depois instancie seus clientes
`docker run -it --rm -v <CAMINHO_ABSOLUTO_PARA_A_PASTA_CLIENT/SRC>:/app/src node-client`

## Trabalhos futuros
 - Conexão com banco de dados MongoDB
 - Gerar relatório com os resultados
 
