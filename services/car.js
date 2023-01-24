const Car = require('../models/car');
const User = require('../models/user');
const { hasCarDb, addClientCarDb } = require('./user');

const createExitRequest = async (req, res) => {
    const no = req.params.immatriculation;
    await createExitRequestDb(no);
    res.status(204).json({state: 'Success'});
}

const createExitRequestDb = async (immatriculation) => {
    const oldCar = await Car.findOne({immatriculation: immatriculation.toUpperCase().trim(), exitTicket: false});
    oldCar.exitTicket = true;
    await Car.findOneAndUpdate({immatriculation: immatriculation.toUpperCase().trim(), exitTicket: false}, oldCar);
}

const getRepairsHistory = async (req, res) => {
    const no = req.params.immatriculation;
    const repairs = await getRepairsHistoryDb(no);
    res.json(repairs);
}

// mbola tokony not null fa tsy votery
const getRepairsHistoryDb = async (immatriculation) => {
    const res = [];
    const cars = await Car.find({immatriculation: immatriculation.toUpperCase().trim(), exitTicket: true});
    cars.forEach((car) => {
        car.repairs.forEach((repair) => {
            res.push(repair);
        })
    });
    return res;
}

const getCarRepairs = async (req, res) => {
    const no = req.params.immatriculation;
    const repairs = await getCarRepairsDb(no);
    if(!repairs)
        return res.status(400).json({message: "Cette voiture n'exite pas ou n'est pas au garage"})
    res.json(repairs);
}

// mbola tokony not null
const getCarRepairsDb = async (immatriculation) => {
    const car = await Car.findOne({immatriculation: immatriculation.toUpperCase().trim(), exitTicket: false});
    return car?.repairs;
}

const getCars = async (req, res) => {
    if(req.query.immatriculation)
        req.query.immatriculation = req.query.immatriculation.toUpperCase().replaceAll(' ', '');
    const cars = await getCarsDb(req.query || undefined);
    res.json(cars);
}

const getCarsDb = async (where = undefined) => {
    if(where.user) {
        const user = await User.findOne({_id: where.user});
        return user.cars;
    } else {
        const cars = await Car.find(where);
        return cars;
    }
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
    depositCar,
    getCarRepairs,
    getRepairsHistory,
    createExitRequest
};