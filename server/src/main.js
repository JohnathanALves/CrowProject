var os = require('os');
var iputils = require('ip');
var ifaces = os.networkInterfaces();
var PORT = 6024;

var ifaceKey = Object.keys(ifaces)[1];

var NET_ADAPTER = ifaces[ifaceKey].pop(); //main network adapter
var IP_ADDR = NET_ADAPTER['address'];
var NETMSK_ADDR = NET_ADAPTER['netmask'];
var BROADCAST_ADDR = iputils.subnet(IP_ADDR, NETMSK_ADDR)['broadcastAddress'];

var dgram = require('dgram'); 
var server = dgram.createSocket("udp4"); 

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
  });
  
server.on('message', (msg, rinfo) => {
    // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.bind({ 
    port: 6024,
    // address: 'localhost'
},
    function() {
    server.setBroadcast(true);
    setInterval(broadcastNew, 3000);
});

function broadcastNew() {
    var message = new Buffer("Broadcast message!");
    server.send(message, 0, message.length, PORT, BROADCAST_ADDR, function() {
    });
}