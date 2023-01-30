const { findById } = require('../models/car');
const Car = require('../models/car');
const User = require('../models/user');
const { sendMail } = require('./mail');
const { hasCarDb, addClientCarDb } = require('./user');

const exitTicketValidation = async (req, res) => {
    try {
        const car = await exitTicketValidationDb(req.params.id);
        const user = await User.findOne({"cars.immatriculation": car.immatriculation});
        sendMail(user.email, car, `${user.lastName} ${user.firstName}`);
        res.json(car);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const exitTicketValidationDb = async (id) => {
    const car = await Car.findById(id);
    car.recoveryDate = new Date();
    const newCar = await Car.findByIdAndUpdate(id, car, {new: true});
    return newCar;
}

const exitRequestList = async (req, res) => {
    try {
        const cars = await exitRequestListDb(req.query.mechanic);
        res.json(cars);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const exitRequestListDb = async (mechanic) => {
    const cars = await getCarsDb({"mechanic.email": mechanic, recoveryDate: null, exitTicket: true});
    return cars;
}

const updateRepairProgress = async (req, res) => {
    try {
        const car = await updateRepairProgressDb(req.params.immatriculation, req.body.name, req.body.progression);
        res.status(204).json(car);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

const updateRepairProgressDb = async (id, repair, progress) => {
    const car = await Car.findById(id);
    if(car) {
        car.repairs.every(r => {
            if(r.name === repair) {
                r.progression = progress;
                return false;
            }
            return true;
        });
        const newCar = await Car.findByIdAndUpdate(id, car, {new: true});
        return newCar;
    } else
        throw new Error(`Cette voiture n'existe pas`);
}

const listReceivedCars = async (req, res) => {
    try {
        const cars = await listReceivedCarsDb(req.query.mechanic);
        res.status(200).json(cars);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

const listReceivedCarsDb = async (mechanic) => {
    const cars = await getCarsDb({"mechanic.email": mechanic, recoveryDate: null, exitTicket: false});
    return cars;
}

const addRepairs = async (req, res) => {
    try {
        const cars = await addRepairsDb(req.params.immatriculation, req.body.repairs);
        res.status(204).json(cars);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

const addRepairsDb = async (immatriculation, repairs) => {
    const car = await Car.findOne({immatriculation, recoveryDate: null});
    if(car) {
        car.repairs = car.repairs.concat(repairs);
        const newCar = await Car.findOneAndUpdate({immatriculation, recoveryDate: null}, car, {new: true});
        return newCar;
    } else 
        throw new Error("Cette voiture n'est pas au garage");
}

const getNonReceivedCars = async (req, res) => {
    try {
        const cars = await getCarsDb({mechanic: null});
        res.json(cars);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
}

const isParkedDb = async (immatriculation) => {
    const car = await Car.findOne({
        immatriculation: immatriculation.toUpperCase().trim(), 
        recoveryDate: null,
    });
    if(!car) {
        return {
            parked: false,
            requested: false
        }
    } else {
        return {
            parked: true,
            requested: car.exitTicket
        }
    }
}


const createExitRequest = async (req, res) => {
    const no = req.params.immatriculation;
    await createExitRequestDb(no);
    res.status(204).json({status: 'Success'});
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
    const car = await Car.findOne({immatriculation: immatriculation.toUpperCase().trim(), recoveryDate: null}).select("immatriculation brand model repairs");
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
        let res = carList.filter((car) => {
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
        res = res.map(async (car) => {
            const status = await isParkedDb(car.immatriculation);
            return {
                _id: car._id,
                immatriculation: car.immatriculation,
                brand: car.brand,
                model: car.model,
                status
            }
        })
        return Promise.all(res).then((data) => {
            return data
        }).catch(() => {
            return []
        });
    } else {
        if(where.user) {
            const userString = where.user;
            delete where.user;
            const data = Object.entries(where);
            const user = await User.findOne({_id: userString});
            let res = user.cars.filter((car) => {
                const match = [];
                data.forEach(d => {
                    if(m = car[d[0]].match(new RegExp(d[1], 'gi')))
                        match.push(m);
                });
                return match.length > 0;
            });
            if(data.length === 0) {
                res = user.cars.map(async (car) => {
                    return {
                        immatriculation: car.immatriculation,
                        brand: car.brand,
                        model: car.model,
                        _id: car._id,
                        status: await isParkedDb(car.immatriculation)
                    }
                })
                return Promise.all(res).then((data) => {
                    return data
                }).catch(() => {
                    return []
                });
            }
            res = res.map(async (car) => {
                return {
                    immatriculation: car.immatriculation,
                    brand: car.brand,
                    model: car.model,
                    _id: car._id,
                    status: await isParkedDb(car.immatriculation)
                }
            })
            return Promise.all(res).then((data) => {
                return data
            }).catch(() => {
                return []
            });
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
    createExitRequest,
    getNonReceivedCars,
    addRepairs,
    listReceivedCars,
    updateRepairProgress,
    exitRequestList,
    exitTicketValidation,
};