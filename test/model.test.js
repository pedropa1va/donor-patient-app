/*
File to test the model in the db
*/
var expect = require('chai').expect;

var Donor = require('../app.js').model;

describe(' Blood donor model test',function() {
	
	afterEach(function(done){
		Donor.remove({id:'eliminate'},function(){
			done();
		});
	});

	it('should be invalid if any model property is empty (they are all required)', function(done) {
		var mod = new Donor();
		mod.validate(function(err) {
			expect(err.errors.firstName).to.exist;
			expect(err.errors.lastName).to.exist;
			expect(err.errors.telephone).to.exist;
			expect(err.errors.email).to.exist;
			expect(err.errors.bloodType).to.exist;
			expect(err.errors.latitude).to.exist;
			expect(err.errors.longitude).to.exist;
			expect(err.errors.ip).to.exist;
			expect(err.errors.id).to.exist;
			done();
		});
	});

	it('should create new document (donor) if all inputs are present', function(done) {
		var mod = new Donor({
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
		})

		expect(Donor.findOne({ip: 'eliminate'})).to.not.equal(null);

		done();
	});


});