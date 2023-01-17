const User = require('../models/user');
const bcrypt = require('bcrypt');

const createClient = async (req, res) => {
    try {
        const oldUser = await User.findOne({ email: req.body.email });
        if(oldUser !== null)
            return res.status(400).json({ message: 'Email already used' });
        const user = new User({
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            email: req.body.email,
            contact: req.body.contact,
            password: await bcrypt.hash(req.body.password, 10),
            type: 1
        });
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createClient };