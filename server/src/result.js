var mongoose = require('mongoose');

var resultSchema = mongoose.Schema({
    command: String,
    client_id: String,
    net_time: Number,
    exec_time: Number
});
var Result = mongoose.model('DataModel', resultSchema);

module.exports = Result;
