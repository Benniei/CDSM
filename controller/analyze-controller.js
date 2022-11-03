// Local imports
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Analyzes sharing permissions of all files in a snapshot
// sharingAnalysis = async function(snapshotId, driveMap, threshold) {
sharingAnalysis = async function(req, res) {

    // Temp - Need to retrieve snapshotId and user threshold from request
    // const owner = '634cb4405445ff8fb73a6749';    // Bennie
    // const owner = '63622af03f1cede505453ce6';    // Richard
    // const owner = '6358b63f68f6810c650732af';    // Brandon
    const snapshot = await FileSnapshot.findOne({ owner: owner });
    console.log(snapshot);
    const threshold = 0.8;

    // Map of all files in the user's drives
    // let map = driveMap;
    let map = null;
    // If a driveMap was not included, create one
    if (!map) {
        map = new Map();
        // Retrieve all files in the user's drives
        const fileList = await File.find({ snapshotId: snapshot.snapshotId });
        // Add each file to the drive map
        for (const file of fileList) {
            map.set(file.fileId, file);
        }
    }
    // Retrieve all non-root-folder folder files in the snapshot
    let folderList = await File.find({ snapshotId: snapshot.snapshotId, children: { $ne: null } });
    // Perform sharing analysis on each of the folders
    await Promise.all(folderList.map(async (folder) => {
        // Retrieve children of folder
        let children = await File.find({ snapshotId: snapshot.snapshotId, parent: folder.fileId });
        // Perform fileFolderDifferences on non-root folders
        if (!folder.root) {
            for (const file of children) {
                await fileFolderDifferences(snapshot.snapshotId, file, folder);
            }
        }
    }));
    console.log(`FileFolderDifferences analysis completed for FileSnapshot (${snapshot.snapshotId})`);   

    let finalList = await File.find({ snapshotId: snapshot.snapshotId });
    res.send(finalList);

    // // Iterate through list of files, and determine deviant permissions and folder-file differences
    // await Promise.all(fileList.map(async (file) => {
    //     // Compute file-folder analysis on files that are not the root-folder or are in the root directory
    //     if (file.parent && !(map.get(file.parent)).root) {
    //         await fileFolderDifferences(snapshotId, map.get(file.fileId), map.get(file.parents[0]));
    //     }
    //     // Placeholder for deviant permission analysis

    // }));

    // // For testing
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
    const filePermissions = file.permissions;
    const folderPermissions = folder.permissions;
    // Permissions exclusive to file
    const fileExclusivePermissions = [];
    // Permissions exclusive to folder
    const folderExclusivePermissions = [];
    // Retrieve all permissions exclusive to file
    for (const permissionId of fileExclusiveIds) {
        fileExclusivePermissions.push(filePermissions[permissionId]);
    }
    // Retrieve all permissions exclusive to file
    for (const permissionId of folderExclusiveIds) {
        folderExclusivePermissions.push(folderPermissions[permissionId]);
    }
    // Check if permissions associated with common ids have identical email(?) and role
    for (const permissionId of commonPermissionIds) {
        // Continue loop if either file and folder does not have a permission objects (possible in Shared Drive folders)
        if (!filePermissions || !folderPermissions) {
            continue;
        }
        // If email and role fields are not identical, add the corresponding permission to both exclusive arrays
        if ( (filePermissions[permissionId].emailAddress != folderPermissions[permissionId].emailAddress) || (filePermissions[permissionId].role != folderPermissions[permissionId].role) ) {
            fileExclusivePermissions.push(filePermissions[permissionId]);
            folderExclusivePermissions.push(folderPermissions[permissionId]);
        }
    }
    // Update fileFolderDifferences property of file
    if (fileExclusivePermissions.length > 0 || folderExclusivePermissions.length > 0) {
        const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.fileId }, { $set:{ fileFolderDifferences: { 'fileExclusivePermissions': fileExclusivePermissions, 'folderExclusivePermissions': folderExclusivePermissions } } });
        console.log(`Added fileFolderDifferences for File (${updatedFile.fileId})`);
    }
};




// fileFolderDifferences = async function(snapshotId, file, folder) {
//     // PermissionsIds exclusive to file
//     const fileExclusiveIds = (file.permissionIds).filter((permission) => !(folder.permissionIds).includes(permission));
//     // PermissionsIds exclusive to folder
//     const folderExclusiveIds = (folder.permissionIds).filter((permission) => !(file.permissionIds).includes(permission));
//     // PermissionsIds found in both files (Permissions associated with Ids may not be identical)
//     const commonPermissionIds = (file.permissionIds).filter((permission) => (folder.permissionIds).includes(permission));
//     // Convert file and folder permission objects into maps
//     const filePermissionMap = new Map(Object.entries(file.permissions));
//     const folderPermissionMap = new Map(Object.entries(folder.permissions)); 
//     // Permissions exclusive to file
//     const fileExclusivePermissions = [];
//     // Permissions exclusive to folder
//     const folderExclusivePermissions = [];
//     // Retrieve all permissions exclusive to file
//     fileExclusiveIds.forEach((permissionId) => {
//         fileExclusivePermissions.push(filePermissionMap.get(permissionId));
//     });
//     // Retrieve all permissions exclusive to file
//     folderExclusiveIds.forEach((permissionId) => {
//         folderExclusivePermissions.push(folderPermissionMap.get(permissionId));
//     });
//     // Check if permissions associated with common ids have identical email(?) and role
//     commonPermissionIds.forEach((permissionId) => {
//         // If email and role fields are not identical, add the corresponding permission to both exclusive arrays
//         if ( (filePermissionMap.get(permissionId).emailAddress != folderPermissionMap.get(permissionId).emailAddress) || (filePermissionMap.get(permissionId).role != folderPermissionMap.get(permissionId).role) ) {
//             fileExclusivePermissions.push(filePermissionMap.get(permissionId));
//             folderExclusivePermissions.push(folderPermissionMap.get(permissionId));
//         }
//     });
//     // Update fileFolderDifferences property of file
//     const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.id }, { $set:{ fileFolderDifferences: { 'fileExclusivePermissions': fileExclusivePermissions, 'folderExclusivePermissions': folderExclusivePermissions } } });
//     console.log(`Added fileFolderDifferences for File (${updatedFile.snapshotId}, ${updatedFile.fileId})`);
// };

module.exports = {
    sharingAnalysis
};