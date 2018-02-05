// emissao de eventos
const EventEmitter = require('events')
const util = require('util')

var os = require('os');
var iputils = require('ip');
var ifaces = os.networkInterfaces();


function SocketClient(port, ipaddr) {
    EventEmitter.call(this);
    const that = this;

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
                return callback({ 'ip': rinfo.address, 'porta': rinfo.port });
            });

        }

    });

    client.bind(port);
}

SocketClient.prototype.listener = function (port) {
    EventEmitter.call(this);
    const that = this;

    var net = require('net');
    var server = net.createServer(function (connection) {
        console.log('Servidor Conectou-se!');

        connection.on('data', function (data) {
            let msg = data.toString();

            //executa a função consumidora de tempo
            if (msg.includes('Execute:')) {

                //calcula um numero aleatorio só pra representar o tempo de excução e testar a comunicação
                let res = ((Math.floor((Math.random() * 10) + 1)) * 1000);

                setTimeout(() => {
                    that.emit('execute', res);

                    //precisa criar a prototype.send? ou deixa assim?
                    connection.write(res.toString());
                }, res);

                // let res = msg.slice(8);

            };
        });

        connection.on('end', function () {
            console.log('Servidor Desconectou-se!');
        });
    });
    server.listen(port, function () {
        console.log('listenning to server messages!');
    });
}



util.inherits(SocketClient, EventEmitter)

module.exports = SocketClient;

