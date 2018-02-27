// emissao de eventos
const EventEmitter = require('events')
const util = require('util')


var os = require('os');
var iputils = require('ip');

function SocketMan(ipaddr, broadcast) {
    console.log('Objeto criado! Buscando informacoes de rede..');
    var ifaces = os.networkInterfaces();
    var ifaceKey = Object.keys(ifaces)[1];
    var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
    this._ipAddr = ipaddr ? ipaddr : NET_ADAPTER['address'];
    var NETMSK_ADDR = NET_ADAPTER['netmask'];
    this._broadcastAddr = broadcast ? broadcast : iputils.subnet(this._ipAddr, NETMSK_ADDR)['broadcastAddress'];

    console.log('IP: ' + this._ipAddr);
    console.log('BROADCAST: ' + this._broadcastAddr);
};

SocketMan.prototype.findClients = function (port, timeout, callback) {
    var clients = ['127.0.0.1', this._ipAddr];
    var dgram = require('dgram');
    var server = dgram.createSocket("udp4");
    var broadcastAddr = this._broadcastAddr;
    var loop;
    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        if (`${msg}` == 'Broadcast') { // é uma msg de broadcast
            if ((clients).indexOf(rinfo.address) == -1) { // cliente novo
                console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
                (clients).push(rinfo.address);
            }
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
        setTimeout(function () {
            console.log('encerrando conexão..');
            clearTimeout(loop);
            server.close()
            if (clients) {
                return callback(null, clients.slice(2));
            } else {
                return callback(true, null);
            }
        }, timeout);
    });

    server.bind({
            port: port,
        },
        function () {
            server.setBroadcast(true);
            loop = setInterval(function () {
                broadcastNew()
            }, 500);
        });

    function broadcastNew() {
        var message = new Buffer("Broadcast");
        server.send(message, 0, message.length, port, broadcastAddr, function () {});
    }

}

SocketMan.prototype.Connect = function (client, port, callback) {
    var net = require('net');

    EventEmitter.call(this);
    const that = this;

    //variaveis de tempo
    // let initTotalTime, diff;
    // let NS_PER_SEC = 1e9;

    var client = net.connect({
        host: client,
        port: port
    }, function () {
        console.log('connected to client');

        //inicia a contagem do tempo total
        // initTotalTime = process.hrtime();

        // client.write('Execute:node ./src/consumerTest.js');
    });

    callback(client);

    client.on('data', function (data) {
        let head = (data.toString()).slice(0, 4);
        let msg = (data.toString()).slice(4);

        // console.log('msg: ' + data.toString());

        if (head == 'resp') {
            if(msg == 'error'){
                that.emit('client-error');
            } else {
                let value = parseFloat(msg);
                that.emit('response', value);
            }
        }

        // if (msg.includes('Execute:'))

        // //finaliza a contagem do tempo total
        // const diff = process.hrtime(initTotalTime);

        // let totalTime = diff[0] * NS_PER_SEC + diff[1];

        // //colocar função que salva no banco aqui
        // console.log('tempo total: ' + totalTime + ' ns - tempo de execução: ' + data.toString() + ' ns');

        // //encerra conexão com o cliente
        // client.end();

        // //encerra o processo filho
        // process.send('end');
    });
    client.on('end', function () {
        console.log('disconnected from client');
    });

    client.on('error', function(){
        console.log('Socket Error!');
    });
}

SocketMan.prototype.sender = function (socket, message) {
    socket.write(message, function(){
        console.log('msg: '+ message + ' enviada!');
    });
    
}

SocketMan.prototype.sendExecute = function(socket, comando) {
    let msg = 'exec' + comando.toString();
    this.sender(socket, msg);
}



util.inherits(SocketMan, EventEmitter)


module.exports = SocketMan;