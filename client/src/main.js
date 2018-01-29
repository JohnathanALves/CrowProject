

var PORT = 6024;
var Sm = require('./socketClient.js');
var socketClient = new Sm(PORT) // quando o objeto é criado automaticamente entra em listen até receber resposta do servidor

socketClient.on('FoundServer', function(server){
    //console.log('IP: '+ server.ip);

    // listener para TCP deve ser ativado aqui
    socketClient.listener(PORT);

    // eventos  devem ser registrados depois de encontrado o servidor

    socketClient.on('execute',  function(msg){ // evento é disparado ao receber mensagem para executar
        // msg contem a mesagem enviada do servidor..
        console.log(msg);
    }); 
});

