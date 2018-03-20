var Sm = require('./socketClient.js');
const EventEmitter = require('events');

// emissor de eventos
var eventEmitter = new EventEmitter();

// parametros basicos
var UDP_PORT = 6023;
var TCP_PORT = 6024;

var socketClient = new Sm(); // quando o objeto é criado automaticamente entra em listen até receber resposta do servidor
var conexao; // gambiarra a gente aceita.


socketClient.UDPServer(UDP_PORT, function (server) {
    console.log(`Servidor encontrado! em: ${server.ip}:${server.porta}`);
});

// listener para TCP deve ser ativado aqui
socketClient.TCPServer(TCP_PORT, function (con) {
    conexao = con;
});

var cont; 
var exp; 
var comando;
var loop;

socketClient.on('execute', function (msg) {
    // contagem dos loops
    cont = 0;
    // array com resultados
    exp = [];
    comando = msg.comando;
    loop = msg.repeticoes;
    eventEmitter.emit('atomic_measure');
});

eventEmitter.on('atomic_measure', function () {
    if (cont < loop) {
        atomic_measure(comando, function (err, result) {
            if (err) {
                return console.log('Erro: ' + err);
            }
            cont += 1; //incrementa a contagem
            exp.push(result); // armazena a contagem no array;
            eventEmitter.emit('atomic_measure');
        });
    } else {
        eventEmitter.emit('finished');
    }
});

eventEmitter.on('finished', function () {
    socketClient.sendTimes(conexao, exp);
});



var atomic_measure = function (comando, callback) { // medida atomica do tempo - 1 execucao unica!
    // aqui que entra o consumidor de tempo! a vairavel comando tem o exato comando enviado do servidor
    let initExecTime, diff;
    let NS_PER_SEC = 1e9;
    const exec = require('child_process').exec;
    //inicia a contagem do tempo total
    initExecTime = process.hrtime();
    // Executa um comando que está dentro da variável no client

    exec(comando, (e, stdout, stderr) => {
        if (e instanceof Error) {
            console.error(e);
            // socketClient.sendTime(conexao, 'error'); // envia sinal de erro em caso de nao execucao do comando
            return callback(e, null);
        }
        const diff = process.hrtime(initExecTime);

        let totalExecTime = diff[0] * NS_PER_SEC + diff[1];

        console.log('stdout ', stdout);
        console.log('stderr ', stderr);

        // retorna o tempo de execucao para o servidor
        return callback(null, totalExecTime);
    });
}