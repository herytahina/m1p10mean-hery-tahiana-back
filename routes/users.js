const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.route('/')
.get((req, res) => {
    console.log('GET /users');
})
.post(async (req, res) => {
    const user = new User({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        email: req.body.email,
        contact: req.body.contact,
        password: await bcrypt.hash(req.body.password, 10),
        type: 1
    });
    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;