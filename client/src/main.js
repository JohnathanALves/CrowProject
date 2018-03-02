
var Sm = require('./socketClient.js');
const EventEmitter = require('events');


var PORT = 6024;
var socketClient = new Sm(PORT); // quando o objeto é criado automaticamente entra em listen até receber resposta do servidor


// emissor de eventos
var eventEmitter = new EventEmitter();


socketClient.on('FoundServer', function (server) {

    // listener para TCP deve ser ativado aqui
    socketClient.listener(PORT, function(conexao){
        var comando;
        var loop = 0;
        // contagem dos loops
        var cont = 0;
        // array com resultados
        var exp = [];        
       
        socketClient.on('execute', function(msg){
            comando = msg.comando;
            loop    = msg.repeticoes;
            eventEmitter.emit('atomic_measure');
        });

        eventEmitter.on('atomic_measure', function(){
            if(cont < loop){
                atomic_measure(comando, function(err, result){
                    if (err){
                        return console.log('Erro: '+ err);
                    }
                    cont += 1; //incrementa a contagem
                    exp.push(result); // armazena a contagem no array;
                    eventEmitter.emit('atomic_measure'); 
                });
            } else {
                eventEmitter.emit('finished');
            }
        });  
        
        eventEmitter.on('finished', function(){
            socketClient.sendTimes(conexao, exp);
        });

    });
});



var atomic_measure = function (comando, callback){ // medida atomica do tempo - 1 execucao unica!
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