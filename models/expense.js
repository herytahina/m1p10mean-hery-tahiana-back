const mongoose = require('mongoose');

const expenseModel = new mongoose.Schema({
    title: String,
    type: Number,   // 0 fixe | 1 autre
    amount: String,
    date: Date
});

module.exports = mongoose.model('expense', expenseModel);