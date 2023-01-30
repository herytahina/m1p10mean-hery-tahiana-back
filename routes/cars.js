const express = require('express');
const router = express.Router();
const { depositCar, getCars, getCarRepairs, getRepairsHistory, createExitRequest, getNonReceivedCars, addRepairs, listReceivedCars, updateRepairProgress, exitRequestList, exitTicketValidation, getCarsForPayment, addPayment } = require('../services/car');
const { addClientCar, carReception } = require('../services/user');
const { route } = require('./users');

router.get('/:immatriculation/repairs/history', getRepairsHistory);

router.route('/:immatriculation/repairs')
.get(getCarRepairs)
.post(addRepairs)
.put(updateRepairProgress);

router.put('/:id/recover/validate', exitTicketValidation);

router.put('/:immatriculation/recover', createExitRequest);

router.put('/:immatriculation/reception', carReception);

router.route('/')
.get(getCars)
.post(addClientCar);

router.get('/requested', exitRequestList);

router.get('/received', listReceivedCars);

router.get('/nonReceived', getNonReceivedCars);

router.post('/deposit', depositCar);

router.get('/forPayment', getCarsForPayment);

router.put('/addPayment/:car_id', addPayment);

module.exports = router;