const express = require('express');
const router = express.Router();
const { depositCar, getCars, getCarRepairs, getRepairsHistory, getCarsForPayment, addPayment } = require('../services/car');
const { addClientCar } = require('../services/user');
const { route } = require('./users');

router.get('/:immatriculation/repairs/history', getRepairsHistory);

router.get('/:immatriculation/repairs', getCarRepairs);

router.route('/')
.get(getCars)
.post(addClientCar);

router.post('/deposit', depositCar);

router.get('/forPayment', getCarsForPayment);

router.put('/addPayment/:car_id', addPayment);

module.exports = router;