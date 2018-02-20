var PORT = 6024;
var Sm = require('./socketClient.js');
var socketClient = new Sm(PORT);
// quando o objeto é criado automaticamente entra em listen até receber resposta do servidor

socketClient.on('FoundServer', function (server) {
    //console.log('IP: '+ server.ip);

    // listener para TCP deve ser ativado aqui
    socketClient.listener(PORT, function(conexao){
       setInterval(function(){
           socketClient.sendTime(conexao, 32.5);
       }, 2000);
       
        socketClient.on('execute', function(comando){
        // aqui que entra o consumidor de tempo! a vairavel comando tem o exato comando enviado do servidor

        console.log('comando: '+ comando);
        });
    });    
});