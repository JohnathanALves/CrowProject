const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const remote = electron.remote
const mongoose = require('mongoose');

const sm = require('../../src/socketman.js')
var socketMan = new sm('192.168.100.6', '192.168.100.255');

const {
    fork
} = require('child_process');

const Result = require('../../src/result.js')

const PORT = 6024;
const timeout = 5000;



const cancelBtn = document.getElementById('cancelBtn')
const sendCommandBtn = document.getElementById('sendCommandBtn')
const connetToDb = document.getElementById('connetToDb')

cancelBtn.addEventListener('click', function(ev) {
    var window = remote.getCurrentWindow();
    window.close()
})

connetToDb.addEventListener('click', function(ev) {
    ev.preventDefault();
    let db_ip = document.getElementById('dbIp').value;
    mongoose.connect('mongodb://' + db_ip + '/crow-project-db');
    var db = mongoose.connection;
    db.on('error', function() {
        console.error.bind(console, 'connection error:')
        document.getElementById('isConnectedIcon').style.color = 'red';
    });
    db.once('open', function () {
        document.getElementById('isConnectedIcon').style.color = 'green';
        console.log('Conectado ao servidor MongoDB: ' + db_ip);
    });
        
})

sendCommandBtn.addEventListener('click', function(ev) {
    ev.preventDefault();
    let commandInput = document.getElementById('commandInput')
    let numTimes = document.getElementById('numTimes')

    socketMan.findClients(PORT, timeout, function (err, clients) { // clients é a lista de ip dos clientes..
        if (err) {
            return console.log('erro!');
        }
        console.log(clients);
    
        clients.forEach(client_addr => {
    
            
            //cria o processo filho para o endereço atual
            const forked = fork('../../server/src/messenger.js');
    
            forked.on('message', (msg) => {
                let dados = JSON.parse(msg);
                if (dados.type === 'end') {
                    
                    let execTime    = dados.execTime;                   // tempo de execução (vem do cliente)
                    let totalTime   = dados.totalTime;                  // tempo total de execução (calculado na thread do servidor)
                    let netTime     = (totalTime - execTime) / 2;       // tempo de rede
                    let comando     = dados.comando;                    // comando enviado para ser executado pelo cliente.
                    
                    // Salvando no MongoDB
                    var result = new Result({
                        command: dados.comando,
                        client_id: client_addr,
                        net_time: ((totalTime - execTime) / 2),
                        exec_time: execTime
                    });
                    result.save(function(err, result) {
                        if (err) return console.error(err);
                    });

                    forked.kill('SIGINT');
                    if (forked.killed) {
                        console.log('Child process with PID ' + forked.pid + ' received the kill message.');
                    };
                };
            });
    
            forked.send({
                addr: client_addr,
                port: PORT,
                command: commandInput.value
            });
        });
    });
})