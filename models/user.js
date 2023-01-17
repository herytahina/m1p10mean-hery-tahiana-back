const mongoose = require('mongoose');

const userModel = new mongoose.Schema({
    lastName: String,
    firstName: String,
    email: String,
    contact: String,
    password: String,
    type: Number,
    cars : {
        type: [{
            immatriculation: String,
            brand: String,
            model: String,
        }],
        required: false,
        default: undefined
    },
});

module.exports = mongoose.model('user', userModel);