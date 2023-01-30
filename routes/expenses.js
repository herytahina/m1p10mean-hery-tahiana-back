const express = require('express');
const router = express.Router();
const { addExpense, getExpense, deleteExpense, updateExpense } = require('../services/expense');

router.route('/')
.post(addExpense)
.get(getExpense)
.delete(deleteExpense)
.put(updateExpense);

router.get('/:id', getExpense);

module.exports = router;