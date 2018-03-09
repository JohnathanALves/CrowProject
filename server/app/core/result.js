var mongoose = require('mongoose');

var resultSchema = mongoose.Schema({
    command: String,
    client_id: String,
    net_time: Number,
    exec_time: [{type: Number}],
});
var Result = mongoose.model('Result', resultSchema);

module.exports = Result;
