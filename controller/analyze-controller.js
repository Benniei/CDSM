// Local imports
const File = require('../models/file-model');

/**
 * Analyzes sharing permissions of all files in a FileSnapshot
 * @param {string} snapshotId - Id of the FileSnapshot being analyzed
 * @param {number} threshold - Threshold value set by the user for deviant permission analysis
 */
sharingAnalysis = async function(snapshotId, threshold) {
    // Retrieve all non-root-folder folder files in the snapshot
    let folderList = await File.find({ snapshotId: snapshotId, children: { $ne: null } });
    // Perform sharing analysis on each of the folders
    await Promise.all(folderList.map(async (folder) => {
        // Retrieve children of folder
        let children = await File.find({ snapshotId: snapshotId, parent: folder.fileId });
        // Perform file-folder difference analysis on non-root folders
        if (!folder.root) {
            for (const file of children) {
                await fileFolderDifferences(snapshotId, file, folder);
            }
        }
        // Perform deviant permission analysis on all folders
        await deviantPermissionAnalysis(snapshotId, folder, threshold);
    }));
    console.log(`Sharing Analysis completed for FileSnapshot (${snapshotId})`);   
};

/**
 * Identifies file and folder exclusive permissions
 * @param {string} snapshotId - Id of the FileSnapshot the files belong to
 * @param {Object} file - The file being analyzed
 * @param {Object} folder - The parent of the file being analyzed
 */
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
    // If both file and folder have permissions:
    if (filePermissions && folderPermissions) {
        // Verify that permissions that appear in both file and folder are equivalent in type, email and role
        for (const permissionId of commonPermissionIds) {
            // If email and role fields are not identical, add the corresponding permission to both exclusive arrays
            if (filePermissions[permissionId] != folderPermissions[permissionId]) {
                fileExclusivePermissions.push(filePermissions[permissionId]);
                folderExclusivePermissions.push(folderPermissions[permissionId]);
            }
        }
    }
    // Update fileFolderDifferences property of file
    if (fileExclusivePermissions.length > 0 || folderExclusivePermissions.length > 0) {
        const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.fileId }, { $set:{ fileFolderDifferences: { 'fileExclusivePermissions': fileExclusivePermissions, 'folderExclusivePermissions': folderExclusivePermissions } } });
        console.log(`Added fileFolderDifferences for File (${updatedFile.fileId})`);
    }
};

/**
 * Identifies sharing permissions that deviate from those found in the majority
 * @param {string} snapshotId - Id of the snapshot the folder belongs to
 * @param {Object} folder - The folder whose content is being analyzed
 * @param {number} threshold - Threshold value that determines what percentage of files count as a majority
 */
deviantPermissionAnalysis = async function(snapshotId, folder, threshold) {
    // Retrieve children of the folder
    let children = await File.find({ snapshotId: snapshotId, parent: folder.fileId });
    // Map of file permission string arrays
    const filePermissionMap = new Map();
    // Map of all permissions string arrays found throughout the folder's files
    const overallPermissionMap = new Map();
    // Populating the overall permission map
    for (const file of children) {
        // If the file has no permissions, set its permission string array to an empty and continue with the next file
        if (!file.permissions) {
            filePermissionMap.set(file.fileId, []);
            continue;
        }
        // Retrieve sorted array of the file's permission strings
        const permissions = Object.values(file.permissions).sort();
        // Link the file to its permission array in the map
        filePermissionMap.set(file.fileId, permissions);
        // Concatenate all permission strings into a single string
        const combinedString = permissions.join(', ');
        // Increment appearance of permission array in overall permission map
        let object = overallPermissionMap.get(combinedString);
        if (object) {
            overallPermissionMap.set(combinedString, { ...object, count: object.count+1 });
        } else {
            overallPermissionMap.set(combinedString, { permissions: permissions, count: 1 });
        }
    }
    // Determine which permissions belong to the file 'majority' dictated by the user's threshold value
    let majorityPermissions = Object.values(Object.fromEntries(overallPermissionMap)).find(value => value.count / children.length >= threshold);
    // Identify which of the files' permissions deviate from those found in the majority of files
    if (majorityPermissions) {
        for (const file of children) {
            // Continue loop if the file doesn't have any permissions
            if (!file.permissions) {
                continue;
            }
            // Permissions exclusive to file
            const fileExclusivePermissions = (filePermissionMap.get(file.fileId)).filter((permission) => !(majorityPermissions.permissions).includes(permission));
            // Permissions exclusive to majority
            const majorityExclusivePermissions = (majorityPermissions.permissions).filter((permission) => !(filePermissionMap.get(file.fileId)).includes(permission));
            // Update deviantPermissions property of file
            if (fileExclusivePermissions.length > 0 || majorityExclusivePermissions.length > 0) {
                const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.fileId }, { $set:{ deviantPermissions: { 'fileExclusivePermissions': fileExclusivePermissions, 'majorityExclusivePermissions': majorityExclusivePermissions } } });
                console.log(`Added deviantPermissions for File (${updatedFile.fileId})`);
            }
        }
    }
};

module.exports = {
    sharingAnalysis
};