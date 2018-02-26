const electron = require('electron')
const BrowserWindow = electron.remote.BrowserWindow
const remote = electron.remote

const sm = require('../../src/socketman.js')
var socketMan = new sm('192.168.100.6', '192.168.100.255');

const PORT = 6024;
const timeout = 5000;


const cancelBtn = document.getElementById('cancelBtn')
const sendCommandBtn = document.getElementById('sendCommandBtn')

cancelBtn.addEventListener('click', function(ev) {
    var window = remote.getCurrentWindow();
    window.close()
})

sendCommandBtn.addEventListener('click', function(ev) {
    ev.preventDefault();
    let commandInput = document.getElementById('commandInput')
    
    socketMan.findClients(PORT, timeout, function (err, clients) { // clients é a lista de ip dos clientes..
        if (err) {
            return console.log('erro!');
        }
        console.log(clients);
    
        clients.forEach(client_addr => {
    
            
            //cria o processo filho para o endereço atual
            const forked = fork('./src/messenger.js');
    
            forked.on('message', (msg) => {
                let dados = JSON.parse(msg);
                if (dados.type === 'end') {
                    let execTime    = dados.execTime;                   // tempo de execução (vem do cliente)
                    let totalTime   = dados.totalTime;                  // tempo total de execução (calculado na thread do servidor)
                    let netTime     = (totalTime - execTime) / 2;       // tempo de rede
                    let comando     = dados.comando;                    // comando enviado para ser executado pelo cliente.
                    
                    // esron guardar os dados aqui
                    console.log(dados);
    
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
    
            // socketMan.Connect(client_addr, PORT, function(conexao){
            //     socketMan.sendExecute(conexao, 'comandoxyz');
            // }); // a funcao send envia uma mensagem do tipo Execute para o cliente
    
            // socketMan.on('response', function(valor){
            //     console.log('evento!');
            //     console.log(valor);
            // });
        });
    
    });
})