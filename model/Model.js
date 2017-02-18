var Mongoose = require('mongoose');

exports.DonorSchema = new Mongoose.Schema({
   firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    telephone: {type: String, required: true},
    email: {type: String, required: true},
    bloodType: {type: String, required: true},
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true},
    ip: {type: String, required: true},
    id: {type: String, required: true}
});
