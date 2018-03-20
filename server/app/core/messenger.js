var {SocketMan} = require('./socketman.js');

// var COMANDO = 'node' + ' ' +  './src/' + 'consumerTest.js';

process.on('message', (msg) => {
    consumeTime(msg);
});

var consumeTime = function (params) {
    console.log('opa!');
    var comando = params.comando;
    var loop = params.loop;
    
    var socketMan = new SocketMan();
    socketMan.Connect(params.addr, params.port, function(conexao){
        //variaveis de tempo
        let initTotalTime, diff;
        let NS_PER_SEC = 1e9;

        //inicia a contagem do tempo total
        initTotalTime = process.hrtime();

        socketMan.sendExecute(conexao, comando, loop);// envia uma mensagem contendo 
        
        socketMan.on('response', function(valor){
            //finaliza a contagem do tempo total
            const diff = process.hrtime(initTotalTime);
            let totalTime = diff[0] * NS_PER_SEC + diff[1];

            console.log('Recebeu resposta de: '+ params.addr + ' valor: ' + valor);
            
            conexao.end(); // encerra a conexao
                  
            var CTotalTime = 0;
            for (let i = 0; i < loop; i++){
                CTotalTime += valor[i];
            }

            let message = {
                'type': 'end',
                'execTimes' : valor, 
                'totalTime': totalTime, 
                'netTime': ((totalTime - CTotalTime)/2), 
                'comando': comando
            };

            process.send(JSON.stringify(message));
        });

        socketMan.on('client-error', function(){
            console.log ('Erro no cliente: ' + params.addr + '!');
        });
    }); 
};
