var os = require('os');
var iputils = require('ip');
var ifaces = os.networkInterfaces();
var PORT = 6024;

var ifaceKey = Object.keys(ifaces)[1];

var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
var IP_ADDR = NET_ADAPTER['address'];
var NETMSK_ADDR = NET_ADAPTER['netmask'];
var BROADCAST_ADDR = iputils.subnet(IP_ADDR, NETMSK_ADDR)['broadcastAddress'];

console.log('IP: '+IP_ADDR);
console.log('network: '+NETMSK_ADDR);
console.log('broadcast: '+BROADCAST_ADDR);

var dgram = require('dgram');
var client = dgram.createSocket('udp4');

client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    client.setBroadcast(true);
});

client.on('message', function (message, rinfo) {
    console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ' + message);
});

client.bind(PORT);