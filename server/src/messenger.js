var sm = require('./socketman.js');


process.on('message', (msg) => {
    consumeTime(msg);
});

var consumeTime = function (params) {

    var socketMan = new sm();

    
    socketMan.send(params.addr, params.port);
    
    //teste de consumo de tempo.
    // let duration = (Math.floor((Math.random() * 10) + 1)) * 1000;


    // console.log('Time for ' + params.addr + ' is ' + params.time);



    // setTimeout(() => {
    //     const diff = process.hrtime(timeA);
    //     let execTime = diff[0] * NS_PER_SEC + diff[1];
    //     process.send('Benchmark in ' + params.addr + ' took ' + execTime + ' nanoseconds');
    // }, params.time);
};
