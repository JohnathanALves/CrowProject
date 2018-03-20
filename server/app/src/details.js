var ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');
const dt = require('datatables.net')();
const dtbs = require('datatables.net-bs4')(window, $);
const EventEmitter = require('events');

class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter()

const Result = require('../core/result.js');

ipcRenderer.on('store-data', (event, message) => {
    //data = message;
    // myEmitter.emit('event', message);
    // console.log(message)
    myEmitter.emit('dataReceived', message);
});

// myEmitter.on('event', (id) => {
//     Result.findById(id).exec(function (err, gettedData) {
//         if (err) return handleError(err);
//         console.log(gettedData);
//         myEmitter.emit('dataReceived', gettedData);
//     });
// });

myEmitter.on('dataReceived', (res) => {
    let dataset = {};
    dataset.command = res.command;
    dataset.id = res.id;
    dataset.repeat = res.experiments[0].exec_time.length;
    dataset.experiments = mountDataset(res.experiments);
    //dataset.netTime = res.net_time;
    // console.log(dataset);
    myEmitter.emit('datasetMounted', dataset);
});

function mountDataset(data) {
    let dataset = [];

    data.forEach(element => {
        let localData = {};

        let count = element.exec_time.length;
        let values = element.exec_time.reduce((previous, current) => current += previous);
        values /= count;

        localData.mean = values;
        localData.netTime = element.net_time;
        localData.clientId = element.client_id;

        dataset.push(localData);
    });
    return dataset;
};

myEmitter.on('datasetMounted', (dataset) => {
    console.log(dataset.experiments)
    $('#exp').text(dataset.id);
    $('#command').text('Comando: ' + dataset.command);
    $('#repeat').text('Repetições: ' + dataset.repeat);
    // $('#repeat').text('Repetições: ' + dataset.exec_time.length);

    $('#detail').DataTable({
        language: {
            "url": "../locale/Portuguese-Brasil.json"
        },
        destroy: true,
        scrollY: "400px",
        scrollCollapse: true,
        paging: false,
        responsive: true,
        info: false,
        data: dataset.experiments,
        columns: [
            {
                data: 'clientId',
                title: 'ID Cliente'
            },
            {
                data: 'netTime',
                title: 'Tempo de Rede (ns)'
            },
            {
                data: 'mean',
                title: 'ST Médio (ns)'
            }
        ]
    });

    var table = $('#detail').DataTable();

    table.tables().header().to$().addClass('thead-light');

});



