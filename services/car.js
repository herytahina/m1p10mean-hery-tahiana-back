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

const getRepairsHistoryDb = async (immatriculation) => {
    const res = {};
    const cars = await Car.find({immatriculation: immatriculation.toUpperCase().trim(), exitTicket: true, recoveryDate: {$ne: null}});
    cars.forEach((car, i) => {
        if(i===0) {
            res.immatriculation = car.immatriculation;
            res.model = car.model;
            res.brand = car.brand;
            res.repairs = [];
        }
        car.repairs.forEach((repair) => {
            const r = Object.assign({}, repair._doc);
            r.date = car.recoveryDate;
            res.repairs.push(r);
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

const getCarRepairsDb = async (immatriculation) => {
    const car = await Car.findOne({immatriculation: immatriculation.toUpperCase().trim(), exitTicket: false}).select("immatriculation brand model repairs");
    return car;
}

const getCars = async (req, res) => {
    if(req.query.immatriculation)
        req.query.immatriculation = req.query.immatriculation.toUpperCase().replaceAll(' ', '');
    const cars = await getCarsDb(req.query || undefined);
    res.json(cars);
}

const getCarsDb = async (where = undefined) => {
    if(where.search) {
        const userString = where.user;
        delete where.user;
        const cars = await User.findOne({_id: userString}).select('cars -_id');
        const carList = cars?.cars.slice() || [];
        const res = carList.filter((car) => {
            const carCopy = Object.assign({}, car._doc);
            delete carCopy._id;
            let match = [];
            const data = Object.entries(carCopy);
            data.forEach(d => {
                if(m = where.search.match(new RegExp(d[1], 'gi')) || (m = d[1].match(new RegExp(where.search, 'gi')))) {
                    if(m instanceof Array)
                        match = match.concat(m);
                    else
                        match.push(m);
                }
            });
            return match.length > 0;
        });
        return res;
    } else {
        if(where.user) {
            const userString = where.user;
            delete where.user;
            const data = Object.entries(where);
            const user = await User.findOne({_id: userString});
            const res = user.cars.filter((car) => {
                const match = [];
                data.forEach(d => {
                    if(m = car[d[0]].match(new RegExp(d[1], 'gi')))
                        match.push(m);
                });
                return match.length > 0;
            });
            console.log('fory');
            if(data.length === 0) return user.cars;
            return res;
        } else {
            const cars = await Car.find(where);
            return cars;
        }
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