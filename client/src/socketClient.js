// emissao de eventos
const EventEmitter = require('events')
const util = require('util')

var os = require('os');
var iputils = require('ip');
var ifaces = os.networkInterfaces();


function SocketClient(port, ipaddr) {
    EventEmitter.call(this);
    const that = this;
    this._port = port;

    var ifaceKey = Object.keys(ifaces)[1];
    var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
    this._ipAddr = ipaddr ? ipaddr : NET_ADAPTER['address'];
    console.log('IP: ' + this._ipAddr);
    this.findServer(port, function (servidor) {
        that.emit('FoundServer', servidor);
    });
}

SocketClient.prototype.findServer = function (port, callback) {
    var dgram = require('dgram');
    var client = dgram.createSocket('udp4');

    client.on('listening', function () {
        var address = client.address();
        console.log('UDP Client listening on ' + address.address + ":" + address.port);
    });

    client.on('message', function (message, rinfo) {
        console.log('Message from:  ' + rinfo.address + ':' + rinfo.port + ' - ' + message);
        if (message == 'Broadcast') { // msg do tipo broadcast
            let message = 'Broadcast';
            client.send(message, 0, message.length, port, rinfo.address, function () {
                client.close();
                return callback({
                    'ip': rinfo.address,
                    'porta': rinfo.port
                });
            });

        }

    });

    client.bind(port);
}

SocketClient.prototype.listener = function (port, callback) {
    EventEmitter.call(this);
    const that = this;
    var conexao;

    var net = require('net');
    var server = net.createServer(function (connection) {
        callback(connection);
        console.log('Servidor Conectou-se!');

        connection.on('data', function (data) {
            let head = (data.toString()).slice(0, 4);
            let msg = (data.toString()).slice(4);
    

            if (head == 'exec') {
                that.emit('execute', msg);
            }
            //executa a função consumidora de tempo
            // if (msg.includes('Execute:')) {
            //     //variaveis de tempo
            //     let initExecTime, diff;
            //     let NS_PER_SEC = 1e9;

            //     let command = msg.slice(8);

            //     const exec = require('child_process').exec;

            //     //inicia a contagem do tempo total
            //     initExecTime = process.hrtime();

            //     exec(command, (e, stdout, stderr) => {
            //         if (e instanceof Error) {
            //             console.error(e);
            //             throw e;
            //         }
            //         console.log('stdout ', stdout);
            //         console.log('stderr ', stderr);

            //         const diff = process.hrtime(initExecTime);

            //         let totalExecTime = diff[0] * NS_PER_SEC + diff[1];
            //         // that.emit('execute', res);
            //         connection.write(totalExecTime.toString());
            //     });
            //     // //calcula um numero aleatorio só pra representar o tempo de execução e testar a comunicação
            //     // let res = ((Math.floor((Math.random() * 10) + 1)) * 1000);

            //     // setTimeout(() => {
            //     //     that.emit('execute', res);

            //     //     //precisa criar a prototype.send? ou deixa assim?
            //     //     connection.write(res.toString());
            //     // }, res);

            //     // let res = msg.slice(8);

            // };

        });

        connection.on('end', function () {
            console.log('Servidor Desconectou-se!');
            this.findServer(this._port, function (servidor) {
                that.emit('FoundServer', servidor);
            });
        });

        connection.on('error', function(){
            console.log('Socket Error!');
            connection.close();
        });
    });

    server.listen(port, function () {
        console.log('listenning to server messages!');
    });
    
}

SocketClient.prototype.sender = function (conexao, message) {
    if (conexao.destroyed){
        console.log('Conexao encerrada!');
        return false
    } else {
        conexao.write(message.toString(), function(){
            return true;
        });
    }    
}

SocketClient.prototype.sendTime = function (conexao, execTime){
    let msg = 'resp' + execTime.toString(); 
    this.sender(conexao, msg);
}

util.inherits(SocketClient, EventEmitter)

module.exports = SocketClient;