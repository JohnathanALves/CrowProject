const electron = require('electron');
const mongoose = require('mongoose');

const BrowserWindow = electron.remote.BrowserWindow;
const remote = electron.remote;

// Require jQuery
const $ = require('jquery');
const dt = require('datatables.net')();
const dtbs = require('datatables.net-bs4')(window, $);

window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js');
window.Bootstrap = require('bootstrap');

const {
    SocketMan,
    getIfaces
} = require('../core/socketman.js');

const { fork } = require('child_process');

const Result = require('../core/result.js');

const TCP_PORT = 6024;
const UDP_PORT = 6023;
const UDP_TIMEOUT = 5000;

const cancelBtn = document.getElementById('cancelBtn');
const sendCommandBtn = document.getElementById('sendCommandBtn');
const ifaceSelector = document.getElementById('ifaceSelector');
const clientList = document.getElementById('clientList');
const refreshclientListBtn = document.getElementById('refreshClientList');

const path = require('path');

const EventEmitter = require('events');

class MyEmitter extends EventEmitter { };
const tableEmitter = new MyEmitter();
const eventEmitter = new MyEmitter(); // emissor de eventos para lógica de resultados

var dbConfigured = false; //flag de database configurada
var data = [];

var clients = [];
var socketMan;
// conf lista de interfaces
let ifacesList = getIfaces();
ifacesList.forEach(iface => {
    ifaceSelector.options[ifaceSelector.options.length] = new Option(iface);
});


// Botão de sair da aplicação
cancelBtn.addEventListener('click', function (ev) {
    var window = remote.getCurrentWindow();
    window.close()
});

// Botão de conectar à base de dados
connectToDb.addEventListener('click', function (ev) {
    ev.preventDefault();

    var form = $("#dbForm");
    $('#dbAlert').hide();

    if (form[0].checkValidity() === true) { //valida o ip de acordo com o pattern lá no html

        $('#loadingModal').modal({ backdrop: 'static', keyboard: false }); //mostra o loading
        // Conecta ao banco
        let db_ip = document.getElementById('dbIp').value;
        mongoose.connect('mongodb://' + db_ip + '/crow-project-db');
        var db = mongoose.connection;

        //Exibe os erros
        db.on('error', function (err) {
            dbConfigured = false;
            $('#dbAlert p').text("Erro: " + err.message);
            $("#cmdFieldset").prop('disabled', true);
            $('#dbConnected').show();
            animateAlert('#dbAlert', 'alert-danger', 'alert-success');
            $('#output').hide();
            console.log(err);
        });
        db.once('open', function () {
            dbConfigured = true; //seta a flag de db configurada
            let interface = ifaceSelector.value;
            socketMan = new SocketMan(interface);
            setTimeout(() => {
                getData();
                $('#dbConnected').hide(); //esconde a mensagem de conexão necessária
                $('#clickClient').text('Antes de realizar um experimento atualize a lista de clientes.'); //muda o texto do aviso
                $('#dbAlert p').text('Conectado ao servidor MongoDB: ' + db_ip + '. Você já pode realizar seus experimentos ou visualizar os dados.');
                $("#refreshClientList").prop('disabled', false); //permite a atualização da lista de clientes
                animateAlert('#dbAlert', 'alert-success', 'alert-danger');
            }, 1000);

        });

    }
    else {
        //ev.preventDefault();
        ev.stopPropagation(); //evita o submit caso o ip não seja validado
    };

    form.addClass('was-validated'); //adiciona a classe que exibe as mensagem de validação do IP
});

//botão de atualizar lista de clientes
refreshclientListBtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    $('#loadingModal').modal({ backdrop: 'static', keyboard: false }); //mostra o loading
    clients = [];
    socketMan.findClients(UDP_PORT);
    socketMan.on('NewClient', client => {
        if (clients.indexOf(client) == -1) {
            console.log(`Found client: ${client}`);
            clients.push(client); //adiciona ip do cliente a lista;
        }
    });
    setTimeout(function () {
        socketMan.stopUDP();
        
        clientList.innerHTML = '';
        
        clients.forEach(client => {
            let li = document.createElement("li");
            li.className = 'list-group-item text-center';
            li.appendChild(document.createTextNode(client));
            clientList.appendChild(li);
        });

        $('#loadingModal').modal('hide'); // esconde o loading
        if (clients.length) {
            $('#clickClient').hide(); //remove o aviso para atualizar a lista de clientes
            $("#cmdFieldset").prop('disabled', false); //permite a inserção dos comandos
            // animateAlert('#clickClient', 'alert-warning', 'alert-danger');
        }
        else {
            $('#clickClient').text('Nenhum cliente encontrado.'); //muda o texto do aviso
            animateAlert('#clickClient', 'alert-danger', 'alert-warning');
        }


    }, UDP_TIMEOUT);
    // $("#dbFieldset").prop('disabled', false); //permite a configuração do DB
    console.log('teste');
});




//botão de enviar os comandos
sendCommandBtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    var form = $("#cmdForm");
    if (dbConfigured) {
        if (form[0].checkValidity() === true) {

            $('#loadingModal').modal({ backdrop: 'static', keyboard: false }); //chama o modal

            let commandInput = document.getElementById('commandInput')
            let repeatNumber = document.getElementById('repeatNumber')

            console.log('clients: ' + clients);


            var cont = clients.length;
            var results = [];
            clients.forEach(client_addr => {

                //cria o processo filho para o endereço atual
                const forked = fork('./core/messenger.js');

                forked.on('message', (msg) => {
                    let dados = JSON.parse(msg);
                    if (dados.type === 'end') {

                        eventEmitter.emit('saveResult', {
                            client_id: client_addr,
                            net_time: dados.netTime,
                            exec_time: dados.execTimes

                        });

                        forked.kill('SIGINT');
                        if (forked.killed) {
                            console.log('Child process with PID ' + forked.pid + ' received the kill message.');
                        };
                    };
                });

                forked.send({
                    addr: client_addr,
                    port: TCP_PORT,
                    comando: commandInput.value,
                    loop: repeatNumber.value
                });
            });
            eventEmitter.on('saveResult', res => {
                console.log(cont);
                if (cont) {
                    results.push(res);
                    cont--;
                    if (!cont) {
                        eventEmitter.emit('saveData');
                    }
                }
            });
            eventEmitter.on('saveData', () => {
                let exp = new Result({
                    'command': commandInput.value,
                    'experiments': results
                });
                exp.save(function (err) {
                    if (err) return console.log('Save Error!');
                    $('#loadingModal').modal('hide'); // esconde o loading
                });
            })
        }
        else {
            ev.stopPropagation();
        };
        form.addClass('was-validated');
    };
});




// sendCommandBtn.addEventListener('click', function (ev) {
// sendCommandBtn.addEventListener('click', function (ev) {
//     ev.preventDefault();
//     var form = $("#cmdForm");
//     let interface = ifaceSelector.value;
//     var socketMan = new sm(document.getElementById('serverIp').value, document.getElementById('broadcastIp').value);

//     if (dbConfigured) {
//         if (form[0].checkValidity() === true) {
//             let commandInput = document.getElementById('commandInput')
//             let repeatNumber = document.getElementById('repeatNumber')

//             socketMan.findClients(PORT, timeout, function (err, clients) { // clients é a lista de ip dos clientes..
//                 if (err) {
//                     return console.log('erro!');
//                 }
//                 console.log(clients);

//                 clients.forEach(client_addr => {

//                     //cria o processo filho para o endereço atual
//                     const forked = fork('./core/messenger.js');

//                     forked.on('message', (msg) => {
//                         let dados = JSON.parse(msg);
//                         if (dados.type === 'end') {


//                             // Salvando no MongoDB
//                             var result = new Result({
//                                 command: dados.comando,
//                                 client_id: client_addr,
//                                 net_time: dados.netTime,
//                                 exec_time: dados.execTimes
//                             });
//                             result.save(function (err, result) {
//                                 if (err) return console.error(err);
//                                 socketMan = null;
//                             });

//                             forked.kill('SIGINT');
//                             if (forked.killed) {
//                                 console.log('Child process with PID ' + forked.pid + ' received the kill message.');
//                             };
//                         };
//                     });

//                     forked.send({
//                         addr: client_addr,
//                         port: PORT,
//                         comando: commandInput.value,
//                         loop: repeatNumber.value
//                     });
//                 });
//             });
//         }
//         else {
//             ev.stopPropagation();
//         };

//         form.addClass('was-validated');
//     };
// });


tableEmitter.on("dataReady", (data) => {
    $('#output').DataTable({
        language: {
            "url": "../locale/Portuguese-Brasil.json"
        },
        destroy: true,
        responsive: true,
        data: data,
        columns: [
            {
                data: 'id',
                title: 'ID'
            },
            {
                data: 'command',
                title: 'Comando'
            },
            // {
            //     data: 'tempoTotal',
            //     title: 'Tempo Total'
            // },
            // {
            //     data: 'net_time',
            //     title: 'Tempo de Rede'
            // },
            {
                data: null,
                //title: 'Detalhes'
            },
        ],
        columnDefs: [{
            targets: -1,
            defaultContent: "<button class='btn btn-outline-info btn-sm'>Detalhes</button>", //Adiciona o botão de detalhe a cada linha da tabela
            orderable: false
        }]
    });

    // Pinta o header da tabela
    var table = $('#output').DataTable();
    table.tables().header().to$().addClass('thead-light');

    // Adiciona a ação ao botão de detalhes
    $('#output tbody').on('click', 'button', function () {

        let id = table.row($(this).parents('tr')).data(); //Recupera id da linha da tabela

        Result.findById(id).exec(function (err, gettedData) {
            if (err) return handleError(err);
            console.log(gettedData);
            createDetailWindow(gettedData);
        });


        //
    });

});
// Cria a janela de detalhes quando o botão é clicado
function createDetailWindow(data) {
    const modalPath = path.join('file://', __dirname, 'details.html')
    let win = new BrowserWindow({ height: 800, frame: false }) //{ frame: false }

    win.on('close', () => { win = null });
    win.loadURL(modalPath);
    win.webContents.on('did-finish-load', () => {
        win.webContents.send('store-data', data);
    });
    //win.webContents.openDevTools();
    win.once('ready-to-show', () => {
        win.show();
    });
};

function animateAlert(idAlert, newClass, oldClass) {
    $('#loadingModal').modal('hide'); //esconde o loading
    $(idAlert).removeClass(oldClass);
    $(idAlert).addClass(newClass);
    $(idAlert).show();
};

function getData() {
    if (dbConfigured) {
        Result.find().exec(function (err, gettedData) {
            if (err) return handleError(err);
            data = gettedData;
            //console.log(data);
            tableEmitter.emit('dataReady', data);
        });
    }
};