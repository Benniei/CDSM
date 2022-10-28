// Local imports
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Analyzes sharing permissions of all files in a snapshot
// sharingAnalysis = async function(snapshotId, threshold) {
sharingAnalysis = async function(req, res) {

    // Temp - Need to retrieve snapshotId and user threshold from request
    // const snapshotId = '634be8f946cfe52faa624ec6-October 28th 2022, 1:40:44';
    // const threshold = 0.8;

    // Retrieve map-like object of all Files associated with the provided snapshotId
    const snapshot = await FileSnapshot.findOne({ snapshotId: snapshotId }, '-_id myDrive');
    // If snapshot does not exist in the database, throw an error
    if (!snapshot) {
        throw new Error('Could not find FileSnapshot in database.');
    }
    // Convert map-like Object into a map
    let map = new Map(Object.entries(snapshot.myDrive));
    // Retrieve all non-root folder files in the snapshot
    let fileList = await File.find({ snapshotId: snapshotId }, '-_id -__v');

    // Iterate through list of files, and determine deviant permissions and folder-file differences
    await Promise.all(fileList.map(async (file) => {
        // Compute file-folder analysis on files that are not the root-folder or are in the root directory
        if (file.parents && !(map.get(file.parents[0])).root) {
            await fileFolderDifferences(snapshotId, map.get(file.fileId), map.get(file.parents[0]));
        }
        // Placeholder for deviant permission analysis

    }));

    // For testing
    // fileList = await File.find({ snapshotId: snapshotId }, '-_id -__v');
    // res.send(fileList);
};

// Returns list of folder and file permission differences
fileFolderDifferences = async function(snapshotId, file, folder) {
    // PermissionsIds exclusive to file
    const fileExclusiveIds = (file.permissionIds).filter((permission) => !(folder.permissionIds).includes(permission));
    // PermissionsIds exclusive to folder
    const folderExclusiveIds = (folder.permissionIds).filter((permission) => !(file.permissionIds).includes(permission));
    // PermissionsIds found in both files (Permissions associated with Ids may not be identical)
    const commonPermissionIds = (file.permissionIds).filter((permission) => (folder.permissionIds).includes(permission));
    // Convert file and folder permission objects into maps
    const filePermissionMap = new Map(Object.entries(file.permissions));
    const folderPermissionMap = new Map(Object.entries(folder.permissions)); 
    // Permissions exclusive to file
    const fileExclusivePermissions = [];
    // Permissions exclusive to folder
    const folderExclusivePermissions = [];
    // Retrieve all permissions exclusive to file
    fileExclusiveIds.forEach((permissionId) => {
        fileExclusivePermissions.push(filePermissionMap.get(permissionId));
    });
    // Retrieve all permissions exclusive to file
    folderExclusiveIds.forEach((permissionId) => {
        folderExclusivePermissions.push(folderPermissionMap.get(permissionId));
    });
    // Check if permissions associated with common ids have identical email(?) and role
    commonPermissionIds.forEach((permissionId) => {
        // If email and role fields are not identical, add the corresponding permission to both exclusive arrays
        if ( (filePermissionMap.get(permissionId).emailAddress != folderPermissionMap.get(permissionId).emailAddress) || (filePermissionMap.get(permissionId).role != folderPermissionMap.get(permissionId).role) ) {
            fileExclusivePermissions.push(filePermissionMap.get(permissionId));
            folderExclusivePermissions.push(folderPermissionMap.get(permissionId));
        }
    });
    // Update fileFolderDifferences property of file
    const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.id }, { $set:{ fileFolderDifferences: { 'fileExclusivePermissions': fileExclusivePermissions, 'folderExclusivePermissions': folderExclusivePermissions } } });
    console.log(`Added fileFolderDifferences for File (${updatedFile.snapshotId}, ${updatedFile.fileId})`);
};

module.exports = {
    sharingAnalysis
};