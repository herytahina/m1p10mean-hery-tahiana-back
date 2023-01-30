const express = require('express');
const { meanRepairTime } = require('../services/statistics');
const router = express.Router();

router.get('/repairTime', meanRepairTime);

module.exports = router;