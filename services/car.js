const Car = require('../models/car');
const { hasCarDb, addClientCarDb } = require('./user');

const getCars = async (req, res) => {
    if(req.query.immatriculation)
        req.query.immatriculation = req.query.immatriculation.toUpperCase().replaceAll(' ', '');
    const cars = await getCarsDb(req.query || undefined);
    res.json(cars);
}

const getCarsDb = async (where = undefined) => {
    const cars = await Car.find(where);
    return cars;
}

const depositCar = async (req, res) => {
    req.user = req.query.user;
    req.body.immatriculation = req.body.immatriculation.toUpperCase().replaceAll(' ', '');
    try {
        const oldCar = await getCarsDb({immatriculation: req.body.immatriculation, exitTicket: false});
        if(oldCar.length > 0)
            return res.status(400).json({message: 'Cette voiture est encore au garage'});
        const carToAdd = {
            immatriculation: req.body.immatriculation,
            brand: req.body.brand,
            model: req.body.model,
        };
        if(!await hasCarDb(req.user, req.body.immatriculation))
            await addClientCarDb(req.user, carToAdd);
        const newCar = await addCarDb(carToAdd);
        res.status(201).json(newCar);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const addCarDb = async (car) => {
    const newCar = new Car(car);
    return await newCar.save();
}

module.exports = {
    getCars,
    depositCar 
};