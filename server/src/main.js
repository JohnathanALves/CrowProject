
// var ifaces = os.networkInterfaces();
// var PORT = 6024;

var sm = require('./socketman.js');
var socketMan = new sm();

socketMan.findClients(6024, 10000, function(clients){
    console.log(clients);
});