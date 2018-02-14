//calcula um numero aleatorio só pra representar o tempo de execução e testar a comunicação
let res = ((Math.floor((Math.random() * 10) + 1)) * 1000);

setTimeout(() => {
    console.log('Tempo = ' + res);
}, res);