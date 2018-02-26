var sm = require('./socketman.js');


// var COMANDO = 'node' + ' ' +  './src/' + 'consumerTest.js';


process.on('message', (msg) => {
    consumeTime(msg);
});

var consumeTime = function (params) {

    var socketMan = new sm();
    socketMan.Connect(params.addr, params.port, function(conexao){
        //variaveis de tempo
        let initTotalTime, diff;
        let NS_PER_SEC = 1e9;

        //inicia a contagem do tempo total
        initTotalTime = process.hrtime();

        socketMan.sendExecute(conexao, params.command);// envia uma mensagem do tipo Execute para o cliente
        
        socketMan.on('response', function(valor){
            //finaliza a contagem do tempo total
            const diff = process.hrtime(initTotalTime);
            let totalTime = diff[0] * NS_PER_SEC + diff[1];

            console.log('Recebeu resposta de: '+ params.addr + ' valor: ' + valor);
            
            conexao.end(); // encerra a conexao
            let message = {'type': 'end' ,'execTime' : valor, 'totalTime': totalTime, 'comando': params.command};
            process.send(JSON.stringify(message));
        });

        socketMan.on('client-error', function(){
            console.log ('Erro no cliente: ' + params.addr + '!');
        });
    }); 
};
