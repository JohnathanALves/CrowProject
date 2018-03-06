const electron = require('electron');
const BrowserWindow = electron.remote.BrowserWindow;
const remote = electron.remote;
const mongoose = require('mongoose');

// Require jQuery
const $ = require('jquery');
const dt = require('datatables.net')();
const dtbs = require('datatables.net-bs4')(window, $);

window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js');
window.Bootstrap = require('bootstrap');

const sm = require('../../src/socketman.js');
var socketMan = new sm('192.168.100.6', '192.168.100.255');

const { fork } = require('child_process');

const Result = require('../../src/result.js');

const PORT = 6024;
const timeout = 5000;

const cancelBtn = document.getElementById('cancelBtn');
const sendCommandBtn = document.getElementById('sendCommandBtn');
const connetToDb = document.getElementById('connetToDb');

const path = require('path');

const EventEmitter = require('events');

class MyEmitter extends EventEmitter { }
const tableEmitter = new MyEmitter()

var dbConfigured = false; //flag de database configurada
var data = [];

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
            $('.dbConnected').show();
            animateAlert('#dbAlert', 'alert-danger', 'alert-success');
            $('#output').hide();
            console.log(err);
        });
        db.once('open', function () {
            dbConfigured = true; //seta a flag de db configurada
            setTimeout(() => {
                getData();
                $('.dbConnected').hide(); //esconde a mensagem de conexão necessária
                $("#cmdFieldset").prop('disabled', false); //permite a inserção dos comandos
                $('#dbAlert p').text('Conectado ao servidor MongoDB: ' + db_ip + '. Você já pode realizar seus experimentos ou visualizar os dados.');
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

sendCommandBtn.addEventListener('click', function (ev) {
    var form = $("#cmdForm");

    if (dbConfigured) {
        if (form[0].checkValidity() === true) {
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

                            let execTime = dados.execTime;                   // tempo de execução (vem do cliente)
                            let totalTime = dados.totalTime;                  // tempo total de execução (calculado na thread do servidor)
                            let netTime = (totalTime - execTime) / 2;       // tempo de rede
                            let comando = dados.comando;                    // comando enviado para ser executado pelo cliente.

                            // Salvando no MongoDB
                            var result = new Result({
                                command: dados.comando,
                                client_id: client_addr,
                                net_time: ((totalTime - execTime) / 2),
                                exec_time: execTime
                            });
                            result.save(function (err, result) {
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
        }
        else {
            ev.preventDefault();
            ev.stopPropagation();
        };

        form.addClass('was-validated');
    };
});


tableEmitter.on("dataReady", () => {
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
                data: 'comando',
                title: 'Comando'
            },
            {
                data: 'repeticoes',
                title: 'Repetições'
            },
            {
                data: 'tempoTotal',
                title: 'Tempo Total'
            },
            {
                data: 'tempoRede',
                title: 'Tempo de Rede'
            },
            {
                data: 'tempoServico',
                title: 'Tempo de Serviço'
            },
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
        var data = table.row($(this).parents('tr')).data();
        console.log(data.id);

        createDetailWindow(data);
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
            console.log(data);
            tableEmitter.emit('dataReady');
        });
    }
};