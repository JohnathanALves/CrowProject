var ipcRenderer = require('electron').ipcRenderer;
const $ = require('jquery');
const dt = require('datatables.net')();
const dtbs = require('datatables.net-bs4')(window, $);
const EventEmitter = require('events');

class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter()


var experimento = new Array();
var experimentos = [
    {
        "_id": "5a91857f08516922a71861f2",
        "command": "officia",
        "repeat": 10,
        "experiment": [
            {
                "id": 0,
                "netTime": 58,
                "serviceTime": 15
            },
            {
                "id": 1,
                "netTime": 56,
                "serviceTime": 65
            },
            {
                "id": 2,
                "netTime": 5,
                "serviceTime": 53
            },
            {
                "id": 3,
                "netTime": 44,
                "serviceTime": 22
            },
            {
                "id": 4,
                "netTime": 99,
                "serviceTime": 62
            },
            {
                "id": 5,
                "netTime": 95,
                "serviceTime": 20
            },
            {
                "id": 6,
                "netTime": 73,
                "serviceTime": 34
            },
            {
                "id": 7,
                "netTime": 24,
                "serviceTime": 40
            },
            {
                "id": 8,
                "netTime": 37,
                "serviceTime": 46
            },
            {
                "id": 9,
                "netTime": 36,
                "serviceTime": 61
            }
        ]
    },
    {
        "_id": "5a91857f3413c4317e0c44f6",
        "command": "nisi",
        "repeat": 10,
        "experiment": [
            {
                "id": 0,
                "netTime": 13,
                "serviceTime": 30
            },
            {
                "id": 1,
                "netTime": 25,
                "serviceTime": 34
            },
            {
                "id": 2,
                "netTime": 67,
                "serviceTime": 53
            },
            {
                "id": 3,
                "netTime": 52,
                "serviceTime": 83
            },
            {
                "id": 4,
                "netTime": 92,
                "serviceTime": 4
            },
            {
                "id": 5,
                "netTime": 35,
                "serviceTime": 22
            },
            {
                "id": 6,
                "netTime": 13,
                "serviceTime": 100
            },
            {
                "id": 7,
                "netTime": 14,
                "serviceTime": 89
            },
            {
                "id": 8,
                "netTime": 18,
                "serviceTime": 22
            },
            {
                "id": 9,
                "netTime": 86,
                "serviceTime": 64
            }
        ]
    },
    {
        "_id": "5a91857fa59b7e02e3dad391",
        "command": "nostrud",
        "repeat": 10,
        "experiment": [
            {
                "id": 0,
                "netTime": 42,
                "serviceTime": 26
            },
            {
                "id": 1,
                "netTime": 47,
                "serviceTime": 76
            },
            {
                "id": 2,
                "netTime": 21,
                "serviceTime": 21
            },
            {
                "id": 3,
                "netTime": 90,
                "serviceTime": 94
            },
            {
                "id": 4,
                "netTime": 82,
                "serviceTime": 56
            },
            {
                "id": 5,
                "netTime": 49,
                "serviceTime": 70
            },
            {
                "id": 6,
                "netTime": 29,
                "serviceTime": 61
            },
            {
                "id": 7,
                "netTime": 7,
                "serviceTime": 45
            },
            {
                "id": 8,
                "netTime": 45,
                "serviceTime": 85
            },
            {
                "id": 9,
                "netTime": 97,
                "serviceTime": 69
            }
        ]
    },
    {
        "_id": "5a91857fdabc6b433102c44d",
        "command": "Lorem",
        "repeat": 10,
        "experiment": [
            {
                "id": 0,
                "netTime": 77,
                "serviceTime": 8
            },
            {
                "id": 1,
                "netTime": 17,
                "serviceTime": 39
            },
            {
                "id": 2,
                "netTime": 62,
                "serviceTime": 61
            },
            {
                "id": 3,
                "netTime": 47,
                "serviceTime": 41
            },
            {
                "id": 4,
                "netTime": 53,
                "serviceTime": 14
            },
            {
                "id": 5,
                "netTime": 69,
                "serviceTime": 12
            },
            {
                "id": 6,
                "netTime": 40,
                "serviceTime": 100
            },
            {
                "id": 7,
                "netTime": 2,
                "serviceTime": 98
            },
            {
                "id": 8,
                "netTime": 71,
                "serviceTime": 73
            },
            {
                "id": 9,
                "netTime": 88,
                "serviceTime": 36
            }
        ]
    },
    {
        "_id": "5a91857fa691d60f498472cf",
        "command": "consequat",
        "repeat": 10,
        "experiment": [
            {
                "id": 0,
                "netTime": 18,
                "serviceTime": 70
            },
            {
                "id": 1,
                "netTime": 37,
                "serviceTime": 84
            },
            {
                "id": 2,
                "netTime": 36,
                "serviceTime": 100
            },
            {
                "id": 3,
                "netTime": 79,
                "serviceTime": 76
            },
            {
                "id": 4,
                "netTime": 17,
                "serviceTime": 97
            },
            {
                "id": 5,
                "netTime": 13,
                "serviceTime": 46
            },
            {
                "id": 6,
                "netTime": 57,
                "serviceTime": 28
            },
            {
                "id": 7,
                "netTime": 14,
                "serviceTime": 64
            },
            {
                "id": 8,
                "netTime": 40,
                "serviceTime": 31
            },
            {
                "id": 9,
                "netTime": 15,
                "serviceTime": 11
            }
        ]
    },
    {
        "_id": "5a91857fe43f6908fd903675",
        "command": "mollit",
        "repeat": 10,
        "experiment": [
            {
                "id": 0,
                "netTime": 49,
                "serviceTime": 82
            },
            {
                "id": 1,
                "netTime": 32,
                "serviceTime": 97
            },
            {
                "id": 2,
                "netTime": 97,
                "serviceTime": 82
            },
            {
                "id": 3,
                "netTime": 58,
                "serviceTime": 42
            },
            {
                "id": 4,
                "netTime": 3,
                "serviceTime": 70
            },
            {
                "id": 5,
                "netTime": 94,
                "serviceTime": 40
            },
            {
                "id": 6,
                "netTime": 72,
                "serviceTime": 81
            },
            {
                "id": 7,
                "netTime": 30,
                "serviceTime": 81
            },
            {
                "id": 8,
                "netTime": 6,
                "serviceTime": 100
            },
            {
                "id": 9,
                "netTime": 30,
                "serviceTime": 94
            }, {
                "id": 0,
                "netTime": 49,
                "serviceTime": 82
            },
            {
                "id": 1,
                "netTime": 32,
                "serviceTime": 97
            },
            {
                "id": 2,
                "netTime": 97,
                "serviceTime": 82
            },
            {
                "id": 3,
                "netTime": 58,
                "serviceTime": 42
            },
            {
                "id": 4,
                "netTime": 3,
                "serviceTime": 70
            },
            {
                "id": 5,
                "netTime": 94,
                "serviceTime": 40
            },
            {
                "id": 6,
                "netTime": 72,
                "serviceTime": 81
            },
            {
                "id": 7,
                "netTime": 30,
                "serviceTime": 81
            },
            {
                "id": 8,
                "netTime": 6,
                "serviceTime": 100
            },
            {
                "id": 9,
                "netTime": 30,
                "serviceTime": 94
            }
        ]
    }
];
var id = '';

ipcRenderer.on('store-data', (event, message) => {
    //console.log(message);
    // console.log($('#data h2').length);
    id = message.id;
    // $('#data h2').text(message.id);


    for (var i = 0; i < experimentos.length; i++) {
        if (experimentos[i]._id === id) {
            experimento.push(experimentos[i]);
            break;
        }
    };

    myEmitter.emit('event');
});


myEmitter.on('event', () => {
    $('#exp').text(experimento[0]._id);
    $('#command').text('Comando: ' + experimento[0].command);
    $('#repeat').text('Repetições: ' + experimento[0].repeat);

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
        data: experimento[0].experiment,
        columns: [
            {
                data: 'id',
                title: 'ID'
            },
            {
                data: 'netTime',
                title: 'Tempo de Rede'
            },
            {
                data: 'serviceTime',
                title: 'Tempo de Serviço'
            },
        ]
    });

    var table = $('#detail').DataTable();

    table.tables().header().to$().addClass('thead-light');
});