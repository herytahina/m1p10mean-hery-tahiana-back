const express = require('express');
const router = express.Router();
const { createClient, checkLogin, createAdministrator, getAdministrator, deleteUser } = require('../services/user');

router.route('/')
.post(createClient);

router.post('/login', checkLogin);

router.route('/administrator')
.post(createAdministrator)
.get(getAdministrator)
.delete(deleteUser);


module.exports = router;