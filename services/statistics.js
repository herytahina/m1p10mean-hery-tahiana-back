const Car = require("../models/car")

const meanRepairTime = async (req, res) => {
    try {
        const result = await meanRepairTimeDb(req.query.start, req.query.end);
        res.json({
            duration: result
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const meanRepairTimeDb = async (start, end) => {
    const res = await Car.aggregate([
        {
          $match: {
            depositDate: {
              $gte: new Date(start)
            }, 
            recoveryDate: {
              $lte: new Date(end)
            }
          }
        }, {
          $addFields: {
            duration: {
              $subtract: [
                '$recoveryDate', '$depositDate'
              ]
            }
          }
        }, {
          $group: {
            _id: 0, 
            duration: {
              $avg: '$duration'
            }
          }
        }
    ]);
    return new Date(res[0].duration).toISOString().slice(11, 19);
}

module.exports = {
    meanRepairTime
}