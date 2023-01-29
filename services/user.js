const User = require('../models/user');
const bcrypt = require('bcrypt');

const deleteUser = async(req, res) => {
    await User.deleteOne({_id: req.body.id});
    // console.log(req.body.id);
    res.status(204).json({state: 'success'});
}

const checkLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const isCorrect = await checkLoginDb(email, password);
    if(!isCorrect)
        return res.status(400).json({message: "Email ou mot de passe incorrect."})
    res.json(isCorrect);
}

const checkLoginDb = async (email, password) => {
    const user = await User.findOne({email: email});
    if(user) {
        const res = await bcrypt.compare(password, user.password);
        if(res)
            return user;
    }
    return false;
}

const getAdministrator = async (req, res) => {
    const admin = await User.find({type: 2});
    res.json(admin);
}

const createAdministrator = async (req, res) => {
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
            type: 2
        });
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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

const addClientCar = async (req, res) => {
    req.user = req.query.user;
    req.body.immatriculation = req.body.immatriculation.toUpperCase().replaceAll(' ', '');
    try {
        const carToAdd = {
            immatriculation: req.body.immatriculation,
            brand: req.body.brand,
            model: req.body.model,
        };
        if(!await hasCarDb(req.user, req.body.immatriculation)) {
            const newUser = await addClientCarDb(req.user, carToAdd);
            res.status(201).json(newUser);
        } else {
            res.status(400).json({message: 'Cette voiture existe déjà'});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addClientCarDb = async (clientId, car) => {
    let user = await User.findOne({ _id: clientId });
    user.cars = [
        ...user.cars,
        car
    ];
    const newUser = await User.findOneAndUpdate({_id: clientId}, user, {new: true});
    return newUser;
}

const hasCarDb = async (clientId, immatriculation) => {
    const user = await User.findOne({_id: clientId, 'cars.immatriculation': immatriculation});
    return !(user === null);
}

module.exports = { 
    addClientCar,
    createClient,
    addClientCarDb,
    hasCarDb,
    checkLogin,
    createAdministrator,
    getAdministrator,
    deleteUser,
};