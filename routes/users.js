const express = require('express');
const router = express.Router();
const { createClient, checkLogin } = require('../services/user');

router.route('/')
.post(createClient);

router.post('/login', checkLogin)

module.exports = router;