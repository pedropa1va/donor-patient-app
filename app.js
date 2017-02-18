/*
Initial Setup for express, socket.io, mongodb (mongoose)
*/
'use strict';
//required vars
var express = require('express');
var app     = express();
var path    = require('path');
var io      = require('socket.io');
var chalk   = require('chalk'); //style the console log

var server_ip_address = Number(process.env.OPENSHIFT_NODEJS_IP) || '127.0.0.1'
var server_port = Number(process.env.OPENSHIFT_NODEJS_PORT) || Number(process.env.PORT) || 3000
// Set static paths
app.use(express.static(path.join(__dirname + '/node_modules')));
app.use(express.static(path.join(__dirname + '/public')));



//Mongodb setup -------------------------------------------------

var mongodb_connection_string = 'mongodb://root:123456@localhost/admin'; //change it to your mongo user/pass

if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
}

var Mongoose = require('mongoose');
var db = Mongoose.createConnection(mongodb_connection_string); 

var DonorSchema = require('./model/Model.js').DonorSchema;
var Donor = db.model('donors', DonorSchema);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

var server = app.listen(server_port, server_ip_address,function () {
  console.log(chalk.magenta('Listening on ' + server_ip_address + ', port ' +  server_port));
});

/*
 This middleware will catch any URLs resembling a file extension
 for example: .js, .html, .css
 This allows for proper 404s instead of the wildcard '/*' catching
 URLs that bypass express.static because the given file does not exist.
 */
 app.use(function (req, res, next) {

    if (path.extname(req.path).length > 0) {
        res.status(404).end();
    } else {
        next(null);
    }

});

// Error catching endware.
app.use(function (err, req, res, next) {
    console.error(err, typeof next);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal server error.');
});

// Socket.io setup: -----------------------------------------------
io = io.listen(server);

var alldonors = [];

function updatePins(){
    alldonors = [];
    var allpins = db.collection('donors').find({});
    if(allpins != undefined){ 
        allpins.forEach(function (item){
            alldonors.push(item);
        });
    }

}

io.on('connection', function (socket) {

    // get the ip address and send it to client, so if they post a donor they will have their ip:
    var clientIp = socket.request.connection.remoteAddress;

    socket.emit('getip', clientIp); //emit it back to client

    socket.emit('connected', 'yes'); //for unit tests (please see server_spec.js)

    updatePins();

    console.log("new socket: ", socket.id); //for control only

    socket.on('newpin', function (data) {
        var donor = new Donor(data);
        donor.save(function(err){
            if (err) {
                console.log(err);
            }
        });
        alldonors.push(donor);
        socket.emit('addedpin', 'yes');
    });

    socket.on('editpin', function (data) {
        db.collection('donors').findOneAndUpdate({id: data.id}, data);
        updatePins();
    });

    socket.on('deletepin', function (data) {
        db.collection('donors').remove(data);
        updatePins();
        io.emit('clearpins', {});
    });

    socket.on('getpins', function(){
        io.emit('loadpins', alldonors); //io instead of socket so that all users can receive the new info
    });
    socket.on('getnewpins', function(){
        io.emit('loadnewpins', alldonors);
    });

});


// Exports for unit testing: -----------------------------------------------

module.exports = {
    model: Donor,
    server: server
}