# CrowProject
Javascript library for performance monitor on distributed systems

comando para executar o container no Docker

Servidor
docker run -p 6024:6024 -d -v DIRETORIO_LOCAL_SRC:/app/src node-server

Cliente
docker run -p 6024:6024 -d -v DIRETORIO_LOCAL_SRC:/app/src node-client
