const express = require('express');
const router = express.Router();
const { depositCar, getCars, getCarRepairs, getRepairsHistory, createExitRequest, getNonReceivedCars } = require('../services/car');
const { addClientCar, carReception } = require('../services/user');

router.get('/:immatriculation/repairs/history', getRepairsHistory);

router.get('/:immatriculation/repairs', getCarRepairs);

router.put('/:immatriculation/recover', createExitRequest);

router.put('/:immatriculation/reception', carReception);

router.route('/')
.get(getCars)
.post(addClientCar);

router.get('/nonReceived', getNonReceivedCars);

router.post('/deposit', depositCar);


module.exports = router;