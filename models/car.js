const mongoose = require('mongoose');

const carModel = new mongoose.Schema({
    immatriculation: String,
    brand: String,
    model: String,
    depositDate: {
        type: Date,
        default: new Date()
    },
    recoveryDate: {
        type: Date,
        default: null
    },
    exitTicket: {
        type: Boolean,
        default: false
    },
    repairs : {
        type: [{
            name: String,
            price: Number,
            progression: Number,
            remark: String
        }],
        required: false,
        default: []
    },
    mechanic : {
        type: {
            lastName: String,
            fistName: String,
            email: String,
            contact: String
        },
        required: false,
        default: null
    },
    payments : {
        type: [{
            amount: Number,
            paymentDate: Date
        }],
        required: false,
        default: []
    },
});

module.exports = mongoose.model('car', carModel);