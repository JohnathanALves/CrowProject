// emissao de eventos
const EventEmitter = require('events')
const util = require('util')

var os = require('os');
var iputils = require('ip');
var ifaces = os.networkInterfaces();


function SocketClient (port, ipaddr) {
    EventEmitter.call(this);
    const that = this;

    var ifaceKey = Object.keys(ifaces)[1];
    var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
    this._ipAddr = ipaddr? ipaddr:NET_ADAPTER['address'];
    console.log('IP: '+this._ipAddr);
    this.findServer(port, function(servidor){
        that.emit('FoundServer', servidor);
    });
}

SocketClient.prototype.findServer = function(port, callback){
    var dgram = require('dgram');
    var client = dgram.createSocket('udp4');

    client.on('listening', function () {
        var address = client.address();
        console.log('UDP Client listening on ' + address.address + ":" + address.port);
    });

    client.on('message', function (message, rinfo) {
        console.log('Message from:  ' + rinfo.address + ':' + rinfo.port +' - ' + message);
        if(message == 'Broadcast'){ // msg do tipo broadcast
            let message = 'Broadcast';
            client.send(message, 0, message.length, port, rinfo.address, function(){
                client.close();
                return callback({'ip': rinfo.address,'porta':rinfo.port}); 
            });
            
        }
        
    });
    
    client.bind(port);
}

util.inherits(SocketClient, EventEmitter)

module.exports = SocketClient;

