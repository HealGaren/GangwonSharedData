/**
 * Created by 최예찬 on 2016-08-20.
 */
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ShareData');

var db = mongoose.connection;
db.once('open', function(){
    console.log('mongoose connect done');
});

module.exports = {
    User: require('./user'),
    Spot: require('./spot'),
    Star: require('./star')
};