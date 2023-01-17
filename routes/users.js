const express = require('express');
const router = express.Router();
const { createClient } = require('../services/user');

router.route('/')
.get((req, res) => {
    console.log('GET /users');
})
.post(createClient);

module.exports = router;