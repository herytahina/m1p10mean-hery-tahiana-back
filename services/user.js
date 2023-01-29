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
            const car = await Car.findOne({immatriculation: immatriculation.toUpperCase().replaceAll(' ', '')});
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
};