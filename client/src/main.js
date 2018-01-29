


var Sm = require('./socketClient.js');
var socketClient = new Sm(6024) // quando o objeto é criado automaticamente entra em listen até receber resposta do servidor

socketClient.on('FoundServer', function(server){
    console.log('IP: '+ server.ip);
});