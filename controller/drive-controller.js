// Import modules
const moment = require('moment');

// Local imports
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const GoogleDriveController = require('../controller/google-drive-controller');
const MicrosoftDriveController = require('../controller/onedrive-controller');
const User = require('../models/user-model');


// Creates a FileSnapshot of the user's current drive
async function createFileSnapshot(req, res) {
    try {
        // Retrieve the user's profile
        const user = await User.findById(req.userId, { cloudProvider: 1, filesnapshot: 1, 
                refreshToken: 1, threshold: 1, profileId: 1 });
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        // List of all of the user's drives
        let driveIds;
        // Map of all files in the user's drives
        let fileMap;
        switch (user.cloudProvider) {
            case 'google':
                // Initialize instance of the Google Drive API service
                const driveAPI = await GoogleDriveController.GD_initializeAPI(user.refreshToken);
                driveIds = await GoogleDriveController.GD_getDrives(driveAPI);
                fileMap = await GoogleDriveController.GD_getFileMap(driveAPI, driveIds);
                break;
            case 'microsoft':
                const accessToken = await MicrosoftDriveController.OD_accessToken(user.refreshToken);
                driveIds = await MicrosoftDriveController.OD_getDrives(accessToken);
                fileMap = await MicrosoftDriveController.OD_getFileMap(accessToken, driveIds, user.profileId);
                break;
            default:
                throw new Error('Could not find listed cloud provider.');
        }
        // Create a File Snapshot in our database to obtain a snapshotId
        const newSnapshot = new FileSnapshot({
            owner: user._id,
            snapshotId: user._id + '-' + moment().format('MMMM Do YYYY, H:mm:ss'),
            driveIds: driveIds
        });
        await FileSnapshot.create(newSnapshot);
        // Add the FileSnapshot as the user's most recent FileSnapshot
        if (user.filesnapshot) {
            user.filesnapshot.unshift(newSnapshot.snapshotId);
        } else {
            user.filesnapshot = [newSnapshot.snapshotId];
        }     
        user.save(); 
        // Create a File Document for each file in the user's drive
        await Promise.all(Object.values(Object.fromEntries(fileMap)).map(async function (file) {
            const newFile = new File({
                snapshotId: newSnapshot.snapshotId,
                fileId: file.id,
                name: file.name,
                driveId: file.driveId,
                path: file.path,
                owner: file.owner,
                creator: file.creator,
                sharingUser: file.sharingUser,
                root: file.root,
                parent: file.parent,
                children: file.children,
                permissionIds: file.permissionIds,
                permissions: file.permissions,
                permissionsRaw: file.permissionsRaw,
                lastModifiedTime: file.modifiedTime,
                readable: file.readable,
                writable: file.writable,
                sharable: file.sharable,
                sharing: file.sharing,
            });
            await File.create(newFile);
            console.log(`Added File '${newFile.fileId}' to database.`);
        }));
        console.log(`Added FileSnapshot '${newSnapshot.snapshotId}' to database.`);
        // Send the newly created FileSnapshot's id and owner to the client
        res.status(200).json({ success: true, fileSnapshot: newSnapshot });
    } catch(error) {
        console.error(`Failed to create FileSnapshot. ${error}`);
        res.status(400).json({ success: false, error: error });   
    }
}

// Retrieves files given a snapshot's Id and list of file Ids
async function getFiles(req, res) {
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
}

// Retrieve the content of a folder given its Id
async function getFolder(req, res) {
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
}

// Retrieve a FileSnapshot given its Id
async function getSnapshot(req, res) {
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
}

// Delete all files stored in the database
async function deleteFiles(req, res) {
    // const owner = '634cb4405445ff8fb73a6749';    // Bennie
    // const owner = '63845aaad2866c06db380031';    // Richard
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
}

module.exports = {
    createFileSnapshot,
    getFiles,
    getFolder,
    getSnapshot,
    deleteFiles
};