const Expense = require('../models/expense');

const updateExpense = async(req, res) => {
    const data = { $set: { title: req.body.title, amount: req.body.amount, type: req.body.type, date: req.body.date }};
    await Expense.updateOne({_id: req.query.id}, data);
    res.status(204).json({state: 'expense updated successfully'});
}

const addExpense = async (req, res) => {
    try{
        const expense = new Expense({
            title: req.body.title,
            type: req.body.type,
            amount: req.body.amount,
            date: req.body.date
        });
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
}

const getExpense = async (req, res) => {
    console.log(req.params.id);
    if(req.params.id) {
        const expense = await Expense.findOne({_id: req.params.id});
        res.json(expense);
    } else {
        const expense = await Expense.find();
        res.json(expense);
    }
}

const deleteExpense = async(req, res) => {
    await Expense.deleteOne({_id: req.query.id});
    res.status(204).json({state: 'expense deleted successfully'});
}

module.exports = { 
    addExpense,
    getExpense,
    deleteExpense,
    updateExpense,
};