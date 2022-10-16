const FileSnapshot = require('../models/filesnapshot-model')

getSnapshot = async (req, res) => {
    let id = req.params.id;
    console.log(id);
    const snapshot = await FileSnapshot.findOne({snapshotId: id});
    res.status(200).json(snapshot).end();
}

module.exports = {
    dummy
}