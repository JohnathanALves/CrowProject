// var ifaces = os.networkInterfaces();
// const {
//     fork
// } = require('child_process');



// var mongoose = require('mongoose');
// let db_ip = '172.17.0.4';
// mongoose.connect('mongodb://' + db_ip + '/crow-project-db');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//     console.log('Conectado ao servidor MongoDB: ' + db_ip);
// });

var sm = require('./socketman.js');
var socketMan = new sm();

var PORT = 6024;
var timeout = 5000;

socketMan.findClients(PORT, timeout, function (err, clients) { // clients é a lista de ip dos clientes..
    if (err) {
        return console.log('erro!');
    }
    console.log(clients);

    clients.forEach(client_addr => {

        //cria o processo filho para o endereço atual
        // const forked = fork('./src/messenger.js');

        // forked.on('message', (msg) => {
        //     // console.log('Message from child:', msg);
        //     if (msg === 'end') {
        //         forked.kill('SIGINT');
        //         if (forked.killed) {
        //             console.log('Child process with PID ' + forked.pid + ' received the kill message.');
        //         };
        //     };
        // });

        // forked.send({
        //     addr: client_addr,
        //     port: PORT
        // });

        socketMan.AbreConexao(client_addr, PORT, function(conexao){
            socketMan.sendExecute(conexao, 'comandoxyz');
        }); // a funcao send envia uma mensagem do tipo Execute para o cliente

        socketMan.on('response', function(valor){
            console.log('evento!');
            console.log(valor);
        });
    });

});