var expect = require('chai').expect;
var io = require('socket.io-client');
var should = require('should');

describe('Server socket test ', function() {

	var server,
	model,
	options ={
		transports: ['websocket'],
		'force new connection': true
	};

	beforeEach(function (done) {
        // start the server
        server = require('../app.js').server;
        model = require('../app.js').model;

        done();
    });

	afterEach(function (done) {
		model.remove({ip: 'eliminate'}, function(){
			done();
		});
	});

	it('Should connect a client to server correctly', function(done) {
		var client = io.connect("http://localhost:3000", options); //adjust port and host in case of change

		client.once("connect", function () {
			client.once("connected", function (message) {
				message.should.equal("yes");

				client.disconnect();
				done();
			});
		});
	});

	it('Should insert donor in collection upon newpin emit', function(done) {
		var client = io.connect("http://localhost:3000", options); //adjust port and host in case of change

		client.once('connect', function () {
			client.emit('newpin', {
				firstName: 'Jhon',
				lastName: 'Doe',
				telephone: '+584126876773', //Validation is made in client side
				email: 'JhonDoeEmailTest', //Validation is made in client side
				bloodType: 'ORH-Test',
				latitude: 0,
				longitude: 0,
				ip: 'eliminate',
				id: 'eliminate'
			});

			expect(model.findOne({ip: 'eliminate'})).to.not.equal(null);
			
			client.once('addedpin', function(){ //in order to make sure to remove the test doner
				client.disconnect();
				done();
			});
		});
	});

	it('Should delete donor in collection upon deletepin emit', function(done) {
		var client = io.connect("http://localhost:3000", options); //adjust port and host in case of change

		var mod = new model({
				firstName: 'Jhon',
				lastName: 'Doe',
				telephone: '+584126876773', //Validation is made in client side
				email: 'JhonDoeEmailTest', //Validation is made in client side
				bloodType: 'ORH-Test',
				latitude: 0,
				longitude: 0,
				ip: 'eliminate',
				id: 'eliminate'
		});

		mod.save(function(err){
			if(err) console.log(err);
		});

		client.once('connect', function () {

			client.emit('deletepin', {id: 'eliminate'});
			
			client.disconnect();

		});
		model.findOne({id: 'eliminate'}, function(err, item){
			expect(item).to.equal(null);
		});

		done();
	});
});