const express = require('express');
const router = express.Router();
const { depositCar, getCars, getCarRepairs, getRepairsHistory, createExitRequest } = require('../services/car');
const { addClientCar } = require('../services/user');

router.get('/:immatriculation/repairs/history', getRepairsHistory);

router.get('/:immatriculation/repairs', getCarRepairs);

router.put('/:immatriculation/recover', createExitRequest);

router.route('/')
.get(getCars)
.post(addClientCar);

router.post('/deposit', depositCar);


module.exports = router;