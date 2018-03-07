// emissao de eventos
const EventEmitter = require('events');
const util = require('util');

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
        
        console.log('Servidor Conectou-se!');
        callback(connection);


        connection.on('data', function (data) {
            let objeto = JSON.parse(data);
            if(objeto.header == 'exec'){
                that.emit('execute', {
                    'repeticoes'    : objeto.times,
                    'comando'       : objeto.comando
                });
            }
        });

        connection.on('end', function () {
            console.log('Servidor Desconectou-se!');
            that.findServer(this._port, function (servidor) {
                that.emit('FoundServer', servidor);
            });
        });

        connection.on('error', function(){
            console.log('Socket Error!');
            connection.end();
        });

        
    });

    server.listen(port, function () {
        console.log('listenning to server messages!');
    });
    
}

// SocketClient.prototype.sender = function (conexao, message) { //deprecated
//     if (conexao.destroyed){
//         console.log('Conexao encerrada!');
//         return false
//     } else {
//         conexao.write(message.toString(), function(){
//             return true;
//         });
//     }    
// }

// SocketClient.prototype.sendTime = function (conexao, execTime){ // deprecated
//     let msg = 'resp' + execTime.toString(); 
//     this.sender(conexao, msg);
// }

SocketClient.prototype.sendTimes = function(conexao, times){
    let objeto = {
        'header'    : 'resp',
        'data'      : times      
    };
    console.log(objeto);
    let msg = JSON.stringify(objeto);
    conexao.write(msg, function(){
        console.log('msg enviada para o servidor!');
    });
}

util.inherits(SocketClient, EventEmitter)

module.exports = SocketClient;