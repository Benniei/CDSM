// Being changed to a wrapper.
const GoogleDriveController = require('../controller/google-drive-controller');
const MicrosoftDriveController = require('../controller/onedrive-controller');
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Creates a FileSnapshot of the user's current drive
createFileSnapshot = async function(req, res) {
    try {
        const user = await User.findById(req.userId, { cloudProvider: 1, filesnapshot: 1, refreshToken: 1, threshold: 1 });
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        req.user = user;
        switch (req.user.cloudProvider) {
            case 'google':
                GoogleDriveController.createFileSnapshot(req, res);
                break;
            case 'microsoft':
                MicrosoftDriveController.createFileSnapshot(req, res);
                break;
            default:
                throw new Error('Could not find listed cloud provider');
        }
    } catch(error) {
        console.error(`Failed to create FileSnapshot: ${error}`);
        res.status(400).json({ success: false, error: error });   
    }
};

// Retrieve a FileSnapshot given its Id
getSnapshot = async function(req, res) {
    // Retrieve Id of FileSnapshot from request
    const snapshotId = req.body.id;
    try {
        const snapshot = await FileSnapshot.findOne({ snapshotId: snapshotId });
        if (!snapshot) {
            throw new Error('Unable to find FileSnapshot in database.');
        }
        res.status(200).json({ success: true, snapshot: snapshot });
    } catch(error) {
        console.error(`Failed to retrieve FileSnapshot: ${error}`);
        res.status(400).json({ success: false, error: error });
    }
};

// Retrieves files given a snapshot's Id and list of file Ids
getFiles = async function(req, res) {
    // Retrieve snapshot and file Ids from request
    const { snapshotId } = req.params;
    const fileIds = req.body.fileIds;
    try {
        // Check if the requesting user is in the database
        const user = await User.findById(req.userId);
        if (!user) {
            throw new Error('Unable to find user in the database.');
        }
        // Check if the requesting user has access to the provided FileSnapshot
        if (!user.filesnapshot.includes(snapshotId)) {
            throw new Error('User does not have access to requested file snapshot.');
        }
        // Retrieve the files being requested
        const files = await File.find({ snapshotId: snapshotId, fileId: { $in: fileIds } });
        res.status(200).json({ success: true, files: files });
    } catch(error) {
        console.error(`Failed to retrieve files: ${error}`);
        res.status(400).json({ success: false, error: error });
    }
};

// Retrieve the content of a folder given its Id
getFolder = async function(req, res) {
    // Retrieve FileSnapshot and folder Ids from request
    const { snapshotId, folderId } = req.params;
    try {
        // Check if the requesting user is in the database
        const user = await User.findById(req.userId);
        if (!user) {
            throw new Error('Unable to find user in the database.');
        }
        // Check if the requesting user has access to the provided FileSnapshot
        if (!user.filesnapshot.includes(snapshotId)) {
            throw new Error('User does not have access to requested file snapshot.');
        }
        // Retrieve the folder being requested
        const folder = await File.find({ snapshotId: snapshotId, fileId: folderId });
        // Retrieve file content of the requested folder
        const fileList = await File.find({ snapshotId: snapshotId, parent: folderId });
        // Return the files retrieved as well as the parent folder's file permissions
        let folders = { success: true, folder: fileList, perms: folder[0].permissionsRaw }
        res.status(200).json(folders);
    } catch(error) {
        console.error('Failed to find folder: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
};

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
    getFiles,
    getFolder,
    getSnapshot,
    deleteFiles
};