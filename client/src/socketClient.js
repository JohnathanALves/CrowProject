// emissao de eventos
const EventEmitter = require('events');
const util = require('util');

var os = require('os');
var iputils = require('ip');
var ifaces = os.networkInterfaces();


function SocketClient() {
    EventEmitter.call(this);
    const that = this;
    var ifaceKey = Object.keys(ifaces)[1];
    var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
    this._ipAddr = NET_ADAPTER['address'];
    console.log('IP: ' + this._ipAddr);
}

SocketClient.prototype.UDPServer = function (port, callback) {
    var dgram = require('dgram');
    var client = dgram.createSocket('udp4');

    client.on('listening', function () {
        var address = client.address();
        console.log(`UDP Client listening on port ${port}`);
    });

    client.on('message', function (message, rinfo) {
        console.log('Message from:  ' + rinfo.address + ':' + rinfo.port + ' - ' + message);
        if (message == 'Broadcast') { // msg do tipo broadcast
            let message = 'Broadcast';
            client.send(message, 0, message.length, port, rinfo.address, function () {
                return callback({
                    'ip': rinfo.address,
                    'porta': rinfo.port
                });
            });
        }
    });
    client.bind(port);
}

SocketClient.prototype.TCPServer = function (port, callback) {
    EventEmitter.call(this);
    const that = this;
    var conexao;

    var net = require('net');
    var server = net.createServer(function (connection) {

        callback(connection);

        connection.on('data', function (data) {
            let objeto = JSON.parse(data);
            console.log('Recebimento de daddos: ');
            console.log(objeto.comando);
            if (objeto.header == 'exec') {
                that.emit('execute', {
                    'repeticoes': objeto.times,
                    'comando': objeto.comando
                });
            }
        });

        connection.on('end', function () {
            console.log('TCP Connection Closed');
            connection.end();
        });

        connection.on('error', function () {
            console.log('Socket Error!');
            connection.end();
            server.close();
        });


    });

    server.listen(port, function () {
        console.log(`TCP Server listening on port ${port}`);
    });

}


SocketClient.prototype.sendTimes = function (conexao, times) {
    let objeto = {
        'header': 'resp',
        'data': times
    };
    console.log('envio de dados');
    console.log(objeto);
    let msg = JSON.stringify(objeto);
    conexao.end(msg, function () {
        console.log('msg enviada para o servidor!');
    });
}

util.inherits(SocketClient, EventEmitter)

module.exports = SocketClient;