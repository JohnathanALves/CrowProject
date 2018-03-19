// emissao de eventos
const EventEmitter = require('events')
const util = require('util')


var os = require('os');
var iputils = require('ip');

function getIfaces(){
    let ifaceKeys = os.networkInterfaces();
    return Object.keys(ifaceKeys);
}; 

function SocketMan(ifaceKey) {
    if (ifaceKey){
        let ifaces = os.networkInterfaces();
        let NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
        let NETMSK_ADDR = NET_ADAPTER['netmask'];
        this._ipAddr = NET_ADAPTER['address'];
        this._broadcastAddr = iputils.subnet(this._ipAddr, NETMSK_ADDR)['broadcastAddress'];
        this._clients = ['127.0.0.1', this._ipAddr]; // inicializa lista de clientes
        console.log(`Interface selecionada: '${ifaceKey}'`);
        console.log('IP: ' + this._ipAddr);
        console.log('BROADCAST: ' + this._broadcastAddr);
    }
    else {
        console.log('ifaceKey is null');
    }
};

SocketMan.prototype.stopUDP = function(){
    console.log('Clearing UDP interval');
    this._server.close();
    clearInterval(this._UDPInterval);
};

SocketMan.prototype.findClients = function (port) {
    EventEmitter.call(this);
    const that = this;
    var dgram = require('dgram');
    this._server = dgram.createSocket("udp4");
    var broadcastAddr = this._broadcastAddr;
    var loop;
    this._server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        this._server.close();
    });

    this._server.on('message', (msg, rinfo) => {
        if (`${msg}` == 'Broadcast') { // é uma msg de broadcast
            if ((this._clients).indexOf(rinfo.address) == -1) { // cliente novo
                console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
                that.emit('NewClient', rinfo.address);
            }
        }
    });

    this._server.on('listening', () => {
        const address = this._server.address();
        console.log(`UDP server listening on ${address.address}:${address.port}`);
    });

    this._server.bind({
            port: port,
        },
        function () {
            that._server.setBroadcast(true);
            that._UDPInterval = setInterval(function () {
                broadcastNew()
            }, 500);
        });

    function broadcastNew() {
        var message = new Buffer("Broadcast");
        that._server.send(message, 0, message.length, port, broadcastAddr, function () {});
    }
}

SocketMan.prototype.Connect = function (client, port, callback) {
    var net = require('net');

    EventEmitter.call(this);
    const that = this;

    var client = net.connect({
        host: client,
        port: port
    }, function () {
        console.log('connected to client');

    });

    callback(client);

    client.on('data', function (data) {
        let objeto = JSON.parse(data);

        if (objeto.header == 'resp') {
            value = objeto.data;
            that.emit('response', value);
        }
    });
    client.on('end', function () {
        console.log('disconnected from client');
    });

    client.on('error', function(){
        console.log('Socket Error!');
    });
}

SocketMan.prototype.sender = function (socket, objeto) {
    let msg = JSON.stringify(objeto);
    socket.write(msg, function(){
        console.log('msg ' + msg + ' enviada!');
    });
    
}

SocketMan.prototype.sendExecute = function(socket, comando, repeticoes) {
    let objeto = {
        'header'    :   'exec',
        'comando'   :   comando,
        'times'     :   repeticoes   
    }
    this.sender(socket, objeto);
}



util.inherits(SocketMan, EventEmitter)


module.exports = {SocketMan, getIfaces};