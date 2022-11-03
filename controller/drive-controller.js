// Being changed to a wrapper.
const GoogleDriveController = require('../controller/google-drive-controller');
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Creates a FileSnapshot of the user's current drive
createFileSnapshot = async (req, res) => {
    try {
        const user = await User.findById(req.userId, {_id: 1, refreshToken: 1, filesnapshot: 1, cloudProvider: 1, threshold: 1});
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        req.user = user;
        switch (req.user.cloudProvider) {
            case 'google':
                GoogleDriveController.createFileSnapshot(req, res);
                break;
            default:
                throw new Error('Could not find listed cloud provider');
        }
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

// Delete all files stored in the database
deleteFiles = async function(req, res) {
    // const owner = '634cb4405445ff8fb73a6749';    // Bennie
    // const owner = '63622af03f1cede505453ce6';    // Richard
    // const owner = '6358b63f68f6810c650732af';    // Brandon
    let snapshotList = await FileSnapshot.find({ owner: owner });
    await Promise.all(snapshotList.map(async (snapshot) => {
        await File.deleteMany({ snapshotId: snapshot.snapshotId });
        await FileSnapshot.deleteOne({ snapshotId: snapshot.snapshotId });
    }));
    await User.findOneAndUpdate({ _id: owner }, { filesnapshot: [] });

    // await File.deleteMany({});
    // await FileSnapshot.deleteMany({});
    // await User.updateMany({}, { $set: { filesnapshot: [] } });

    res.send('All files deleted');
};

module.exports = {
    createFileSnapshot,
    deleteFiles
};