const express = require('express');
const router = express.Router();
const { depositCar, getCars } = require('../services/car');
const { addClientCar } = require('../services/user');

router.route('/')
.get(getCars)
.post(addClientCar);

router.post('/deposit', depositCar);

module.exports = router;