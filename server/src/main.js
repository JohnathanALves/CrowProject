
// var ifaces = os.networkInterfaces();
const { fork } = require('child_process');

var sm = require('./socketman.js');
var socketMan = new sm();
var clientMongo = new require('./clientMongo.js')();

var PORT = 6024;
var timeout = 5000;

socketMan.findClients(PORT, timeout, function (err, clients) { // clients é a lista de ip dos clientes..
    if (err) {
        return console.log('erro!');
    }
    console.log(clients);
  
    clients.forEach(client_addr => {

        //cria o processo filho para o endereço atual
        const forked = fork('./src/messenger.js');

        forked.on('message', (msg) => {
            // console.log('Message from child:', msg);
            if (msg === 'end') {
                forked.kill('SIGINT');
                if (forked.killed) {
                    console.log('Child process with PID ' + forked.pid + ' received the kill message.');
                };
            };
        });

        forked.send({
            addr: client_addr,
            port: PORT
        });

        //socketMan.send(client_addr, PORT); // a funcao send envia uma mensagem do tipo Execute para o cliente
    });

});