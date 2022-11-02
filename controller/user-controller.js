// Local imports
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Non-Specific Drive Functions
getSnapshot = async (req, res) => {
    const id = req.body.id;
    console.log(id);
    const snapshot = await FileSnapshot.findOne({snapshotId: id});
    res.status(200).json(snapshot).end();
};

dummy = async (req, res) => {

};

getFolder = async function(req, res) {
    const {id, folderid} = req.params;
    try {
        const user = await User.findById(req.userId, { _id: 0, refreshToken: 1 });
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        const fileList = await File.find({ snapshotId: id, parent: folderid });
        res.status(200).json({ success: true, folder: fileList });
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
};

// User Functions
updateACR = async (req, res) => {
    try {
        const acr = await User.findOneAndUpdate({ _id: req.userId }, { $set:{ access_control_req: req.access_control_req }}, { fields: 'access_control_req -_id', returnDocument: 'after' });
        if (!acr) {
            throw new Error('Could not find User in database.');
        }
        res.status(200).json({ success: true, acr: acr.access_control_req });
    } catch(error) {
        console.error('Failed to update ACR: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

listSnapshots = async (req, res) => {
    try {
        const snapshots = await User.findById(req.userId, { _id: 0, filesnapshot: 1, groupsnapshot: 1 });
        if (!snapshots) {
            throw new Error('Could not find User in database.');
        }
        res.status(200).json({ success: true, snapshots: snapshots });
    } catch(error) {
        console.error('Failed to update ACR: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

module.exports = {
    updateACR,
    listSnapshots,
    getSnapshot,
    getFolder
};