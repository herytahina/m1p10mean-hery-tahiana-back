const express = require('express');
const router = express.Router();
const { createClient, checkLogin, createAdministrator, getAdministrator, deleteUser, updateUser } = require('../services/user');

router.route('/')
.post(createClient);

router.post('/login', checkLogin);

router.route('/administrator')
.post(createAdministrator)
.get(getAdministrator)
.delete(deleteUser)
.put(updateUser);

router.get('/administrator/:id', getAdministrator);


module.exports = router;