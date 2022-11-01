// Local imports
const FileSnapshot = require('../models/filesnapshot-model');

getSnapshot = async (req, res) => {
    const id = req.body.id;
    console.log(id);
    const snapshot = await FileSnapshot.findOne({snapshotId: id});
    res.status(200).json(snapshot).end();
};

dummy = async (req, res) => {

};

module.exports = {
    getSnapshot
};