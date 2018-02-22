var PORT = 6024;
var Sm = require('./socketClient.js');
var socketClient = new Sm(PORT);
// quando o objeto é criado automaticamente entra em listen até receber resposta do servidor

socketClient.on('FoundServer', function (server) {
    //console.log('IP: '+ server.ip);

    // listener para TCP deve ser ativado aqui
    socketClient.listener(PORT, function(conexao){
    //    setInterval(function(){
    //        socketClient.sendTime(conexao, 32.5);
    //    }, 2000);
       
        socketClient.on('execute', function(comando){
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
                    socketClient.sendTime(conexao, 'error'); // envia sinal de erro em caso de nao execucao do comando
                }
                const diff = process.hrtime(initExecTime);

                let totalExecTime = diff[0] * NS_PER_SEC + diff[1];

                console.log('stdout ', stdout);
                console.log('stderr ', stderr);

                // retorna o tempo de execucao para o servidor
                socketClient.sendTime(conexao, totalExecTime);   
            });                
        });    
    });
});
