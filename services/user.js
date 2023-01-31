const User = require('../models/user');
const bcrypt = require('bcrypt');
const Car = require('../models/car');

const carReception = async (req, res) => {
    try {
        const car = await carReceptionDb(req.query.mechanic, req.params.immatriculation);
        if(car) 
            res.status(204).json(car);
        else
            res.status(500).json({message: 'Internal server error'});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const carReceptionDb = async (email, immatriculation) => {
    const mechanic = await User.findOne({email});
    if(mechanic) {
        if(mechanic.type === 2) {
            const car = await Car.findOne({immatriculation: immatriculation.toUpperCase().replaceAll(' ', ''), exitTicket: false, recoveryDate: null});
            if(car) {
                if(car.mechanic)
                    throw new Error("Cette voiture est déjà assignée");
                else {
                    car.mechanic = {
                        lastName: mechanic.lastName,
                        fistName: mechanic.firstName,
                        email: mechanic.email,
                        contact: mechanic.contact
                    }
                    return await Car.findOneAndUpdate({_id: car._id}, car, {new: true});
                }
            } else
                throw new Error("Cette voiture n'existe pas");
        } else
            throw new Error("Vous n'avez pas l'autorisation pour cette action.");
    } else
        throw new Error("Cet utilisateur n'existe pas");
}

const updateUser = async(req, res) => {
    const data = { $set: { lastName: req.body.lastName, firstName: req.body.firstName, email: req.body.email, contact: req.body.contact, type: req.body.type }};
    await User.updateOne({_id: req.query.id}, data);
    res.status(204).json({state: 'user updated successfully'});
}

const deleteUser = async(req, res) => {
    await User.deleteOne({_id: req.query.id});
    // console.log(req.query.id);
    res.status(204).json({state: 'user deleted successfully'});
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
    if(req.params.id) {
        const admin = await User.findOne({_id: req.params.id});
        res.json(admin);
    } else {
        const admin = await User.find({$or: [{type: 2}, {type: 3}]});
        res.json(admin);
    }
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
                type: req.body.type
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
    carReception,
    checkLogin,
    createAdministrator,
    getAdministrator,
    deleteUser,
    updateUser,
};