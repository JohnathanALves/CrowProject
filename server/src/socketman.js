
var os = require('os');
var iputils = require('ip');

function SocketMan (ipaddr, broadcast){
    console.log('Objeto criado! Buscando informacoes de rede..');
    var ifaces = os.networkInterfaces();
    var ifaceKey = Object.keys(ifaces)[1];
    var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
    this._ipAddr = ipaddr? ipaddr:NET_ADAPTER['address'];
    var NETMSK_ADDR = NET_ADAPTER['netmask'];
    this._broadcastAddr = broadcast? broadcast:iputils.subnet(this._ipAddr, NETMSK_ADDR)['broadcastAddress'];
    
    console.log('IP: '+this._ipAddr);
    console.log('BROADCAST: '+this._broadcastAddr);
};

SocketMan.prototype.findClients = function(port, timeout, callback){
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
        if(`${msg}` == 'Broadcast'){ // é uma msg de broadcast
            if ((clients).indexOf(rinfo.address) == -1){ // cliente novo
                console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
                (clients).push(rinfo.address);
            }
        }
    });

    server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
        setTimeout(function(){
            console.log('encerrando conexão..');
            clearTimeout(loop);
            server.close()
            return callback(clients.slice(2));
        }, timeout);
    });

    server.bind({ 
        port: port,
    },
        function() {
        server.setBroadcast(true);
        loop = setInterval(function(){
            broadcastNew()
        }, 500);
    });

    function broadcastNew() {
        var message = new Buffer("Broadcast");
        server.send(message, 0, message.length, port,broadcastAddr , function(){ 
        });
    }

}

module.exports = SocketMan;