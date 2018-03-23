const electron = require('electron');
//const { ipcRenderer } = require('electron');
const mongoose = require('mongoose');

const {BrowserWindow} = electron.remote;
const remote = electron.remote;

const { SocketMan, getIfaces } = require('../core/socketman.js');
const { fork } = require('child_process');
const Result = require('../core/result.js');

const path = require('path');
const EventEmitter = require('events');

// Require jQuery
const $ = require('jquery');
const dt = require('datatables.net')();
const dtbs = require('datatables.net-bs4')(window, $);

window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js');
window.Bootstrap = require('bootstrap');

const TCP_PORT = 6024;
const UDP_PORT = 6023;
const UDP_TIMEOUT = 5000;

const cancelBtn = document.getElementById('cancelBtn');
const sendCommandBtn = document.getElementById('sendCommandBtn');
const ifaceSelector = document.getElementById('ifaceSelector');
const clientList = document.getElementById('clientList');
const refreshclientListBtn = document.getElementById('refreshClientList');
const refreshDatatableBtn = document.getElementById('refreshDatatable');


class MyEmitter extends EventEmitter {};
const tableEmitter = new MyEmitter();
const eventEmitter = new MyEmitter(); // emissor de eventos para lógica de resultados

var dbConfigured = false; //flag de database configurada


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
                $('#refreshDatatable').prop('disabled', false); //habilita o botão para atualizar a tabela
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
            $('#clickClient').hide(); //esconde o alert

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
                    $('#clickClient').text('Experimento concluído! Você já pode consultar os novos dados.');
                    $('#clickClient').show();
                    animateAlert('#clickClient', 'alert-success', 'alert-warning');
                    resetTable(); //atualiza tabela de dados
                    getData();
                });
            })
        }
        else {
            ev.stopPropagation();
        };
        form.addClass('was-validated');
    };
});

//gera a tabela geral
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
                data: 'formatedDate',
                title: 'Data'
            },
            {
                data: 'command',
                title: 'Comando'
            },
            {
                data: null,
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

        let row = table.row($(this).parents('tr')).data(); //Recupera id da linha da tabela
        
        Result.findById(row.id).exec(function (err, gettedData) {
            if (err) return console.log(err);
            //console.log(gettedData);
            //console.log(row.id);
            //ipcRenderer.send('request-mainprocess-action', gettedData);
            //createDetailWindow(gettedData);
            createDetailDataset(gettedData);
        });
    });

});

//captura os dados da tabela geral
function getData() {
    if (dbConfigured) {
        Result.find().exec(function (err, gettedData) {
            if (err) return handleError(err);
            // let data = [];

            // data = gettedData;
            // console.log(data[0].createdAt);
            gettedData.forEach(element => {
                let date = new Date(element.createdAt).toLocaleString();
                element.formatedDate = date;
            });
            tableEmitter.emit('dataReady', gettedData);
        });
    }
};


//retorna da tabela de detalhes para a tabela geral
refreshDatatableBtn.addEventListener('click', function (ev) {
    ev.preventDefault();
    $('#detailDiv').hide(); //esconde a div de detalhes
    $('#backDetailDiv').prop('disabled', true); //desativa o botão de voltar
    $('#backDetailDiv').hide(); // esconde o botão de voltar
    $('#exp').text('Experimentos Realizados');
    resetTable();
    getData();
});

// Cria a janela de detalhes quando o botão é clicado
// function createDetailWindow(data) {
//     const modalPath = path.join('file://', __dirname, 'details.html')
//     let win = new BrowserWindow({ transparent: false, height: 800, frame: false }) //{ frame: false }

//     win.on('closed', () => { 
//         win = null 
//     });
//     win.loadURL(modalPath);
    
//     win.webContents.on('did-finish-load', () => {
//         win.webContents.send('store-data', data);
//     });
//     //win.webContents.openDevTools();
//     win.once('ready-to-show', () => {
//         win.show();
//     });
// };

//gera o dataset da tabela detalhada
function createDetailDataset(data){
    let dataset = {};
    dataset.command = data.command;
    dataset.id = data.id;
    dataset.repeat = data.experiments[0].exec_time.length;
    dataset.experiments = mountDetailDataset(data.experiments);
    dataset.date = data.createdAt;
    //dataset.netTime = data.net_time;
    // console.log(dataset);
    eventEmitter.emit('datasetMounted', dataset);
};

//monta o dataset delhado com médias e etc
function mountDetailDataset(data) {
    let dataset = [];

    data.forEach(element => {
        let localData = {};

        let count = element.exec_time.length;
        let values = element.exec_time.reduce((previous, current) => current += previous);
        values /= count;

        localData.mean = values;
        localData.netTime = element.net_time;
        localData.clientId = element.client_id;

        dataset.push(localData);
    });
    return dataset;
};

//gera a tabela detalhada
eventEmitter.on('datasetMounted', (dataset) => {
    resetTable();
    $('#detailDiv').show(); //mostra a div de detalhes
    $('#backDetailDiv').prop('disabled', false); //ativa o botão de voltar
    $('#backDetailDiv').show(); // mostra o botão de voltar
    $('#exp').text(dataset.id);
    $('#command').text('Comando: ' + dataset.command);
    $('#repeat').text('Repetições: ' + dataset.repeat);
    $('#date').text('Data: ' + dataset.date);
    // $('#repeat').text('Repetições: ' + dataset.exec_time.length);

    $('#output').DataTable({
        language: {
            "url": "../locale/Portuguese-Brasil.json"
        },
        destroy: true,
        scrollY: "400px",
        scrollCollapse: true,
        paging: false,
        responsive: true,
        info: false,
        data: dataset.experiments,
        columns: [
            {
                data: 'clientId',
                title: 'ID Cliente'
            },
            {
                data: 'netTime',
                title: 'Tempo de Rede (ns)'
            },
            {
                data: 'mean',
                title: 'ST Médio (ns)'
            }
        ]
    });

    var table = $('#output').DataTable();

    table.tables().header().to$().addClass('thead-light');

});

//reseta a tabela
function resetTable () {
    $('#output').DataTable().destroy();
    $('#output').empty(); // empty in case the columns change
    //getData();
};

//muda a classe de um alert
function animateAlert(idAlert, newClass, oldClass) {
    $('#loadingModal').modal('hide'); //esconde o loading
    $(idAlert).removeClass(oldClass);
    $(idAlert).addClass(newClass);
    $(idAlert).show();
};

