var mongoose = require('mongoose');

function ClientMongo(url, port){
    mongoose.connect((url || 'mongodb://10.87.41.151/crow-project-db'));
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('Conectado ao servidor MongoDB');
    });
};

ClientMongo.prototype.sendData = function() {

}

module.exports = ClientMongo;
