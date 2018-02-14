var sm = require('./socketman.js');


process.on('message', (msg) => {
    consumeTime(msg);
});

var consumeTime = function (params) {

    var socketMan = new sm();

    
    socketMan.send(params.addr, params.port);
};
