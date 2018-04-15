# CrowProject
Javascript library for performance monitor on distributed systems. built with 
NodeJs and Electron.

## Instruções
Clone o repositório em seu computador:
```bash
git clone https://github.com/JohnathanALves/CrowProject.git
```

Este projeto utiliza o gerenciador de pacotes [npm](https://www.npmjs.com/), que
já é configurado na instalação do [Nodejs](https://nodejs.org/en/).

A interface gráfica foi construída com auxílio do framework
[Electron](https://electronjs.org/), logo, é necessário instalá-lo. Não há
necessidade de instalar a interface gráfica em máquinas que só irão funcionar
como cliente.

Também é necessário uma instância do [MongoDB](https://www.mongodb.com/) que
será utilizada na persistência dos dados.

Dentro dos diretórios ./client e ./server rode o comando:
```bash
npm install
```

## Executando o projeto

Primeiro instacie os clientes.

Em cada nó cliente da rede, dentro da pasta do projeto, no sub-diretório 
**client/src**
execute o comando:
```bash
node main.js
```

Então, no nó servidor, dentro da pasta do projeto sub-diretório **server/app**
execute o comando a seguir para abrir a interface gráfica:
```bash
electron .
```



## Trabalhos futuros
 - [ ] Melhorar o cálculo do tempo de rede
