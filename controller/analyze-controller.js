// Local imports
const File = require('../models/file-model');

/**
 * Analyzes sharing permissions of all files in a FileSnapshot
 * @param {string} snapshotId - Id of the FileSnapshot being analyzed
 * @param {number} threshold - Threshold value set by the user for deviant permission analysis
 */
async function sharingAnalysis(snapshotId, threshold) {
    try {
        // Retrieve all non-root-folder folder files in the snapshot
        let folderList = await File.find({ snapshotId: snapshotId, children: { $ne: null } });
        // Perform sharing analysis on each of the folders
        await Promise.all(folderList.map(async (folder) => {
            // Retrieve children of folder
            let children = await File.find({ snapshotId: snapshotId, parent: folder.fileId });
            // Perform file-folder difference analysis on non-root folders
            if (!folder.root) {
                for (const file of children) {
                    await fileFolderDifferencesAnalysis(snapshotId, file, folder);
                }
            }
            // Perform deviant permission analysis on all folders
            await deviantPermissionAnalysis(snapshotId, folder, threshold);
        }));
        console.log(`Sharing Analysis completed for FileSnapshot '${snapshotId}'.`); 
    } catch (error) {
        throw new Error(`Failed to analyze FileSnapshot '${snapshotId}'. ${error}`);
    }
}

/**
 * Identifies file and folder exclusive permissions
 * @param {string} snapshotId - Id of the FileSnapshot the files belong to
 * @param {Object} file - The file being analyzed
 * @param {Object} folder - The parent of the file being analyzed
 */
async function fileFolderDifferencesAnalysis(snapshotId, file, folder) {
    // Identify sharing permission differences between the file and folder
    const fileDifferences = compareFiles(file, folder);
    const fileExclusivePermissions = fileDifferences[0];
    const folderExclusivePermissions = fileDifferences[1];
    // Update fileFolderDifferences property of file
    if (fileExclusivePermissions.length > 0 || folderExclusivePermissions.length > 0) {
        try {
            const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.fileId }, { $set:{ fileFolderDifferences: { 'fileExclusivePermissions': fileExclusivePermissions, 'folderExclusivePermissions': folderExclusivePermissions } } });
            console.log(`Added fileFolderDifferences for File '${updatedFile.fileId}'.`);
        } catch (error) {
            throw new Error(`Failed to update fileFolderDifferences for file '${file.id}'. ${error}`);
        }  
    }
}

/**
 * Compare the sharing permissions of two files
 * @param {Object} file1 - The first of the two files being compared
 * @param {Object} file2 - The second of the two files being compared
 * @returns {Object[][]} fileDifferences - Array containing each file's exclusive permissions
 */
function compareFiles(file1, file2) {
    // PermissionsIds exclusive to file1
    const file1ExclusiveIds = (file1.permissionIds).filter((permission) => !(file2.permissionIds).includes(permission));
    // PermissionsIds exclusive to file2
    const file2ExclusiveIds = (file2.permissionIds).filter((permission) => !(file1.permissionIds).includes(permission));
    // PermissionsIds found in both files (Permissions associated with Ids may not be identical)
    const commonPermissionIds = (file1.permissionIds).filter((permission) => (file2.permissionIds).includes(permission));
    // Retrieve the sharing permissions of each file
    const file1Permissions = file1.permissions;
    const file2Permissions = file2.permissions;
    // Permissions exclusive to file1
    const file1ExclusivePermissions = [];
    // Permissions exclusive to file2
    const file2ExclusivePermissions = [];
    // Retrieve all permissions exclusive to file1
    for (const permissionId of file1ExclusiveIds) {
        file1ExclusivePermissions.push(file1Permissions[permissionId]);
    }
    // Retrieve all permissions exclusive to file2
    for (const permissionId of file2ExclusiveIds) {
        file2ExclusivePermissions.push(file2Permissions[permissionId]);
    }
    // Verify that permissions that appear in both files are equivalent in type, email/domain, and role
    for (const permissionId of commonPermissionIds) {
        // If the permission properties are not identical, add the corresponding permission to both files' exclusive permission arrays
        if ( (file1Permissions[permissionId] && file2Permissions[permissionId]) && (file1Permissions[permissionId] !== file2Permissions[permissionId]) ) {
            file1ExclusivePermissions.push(file1Permissions[permissionId]);
            file2ExclusivePermissions.push(file2Permissions[permissionId]);
        }
    }
    // Return the file differences as an array containing the files' exclusive permission arrays
    return [file1ExclusivePermissions, file2ExclusivePermissions];
}

/**
 * Identifies sharing permissions that deviate from those found in the majority
 * @param {string} snapshotId - Id of the FileSnapshot the folder belongs to
 * @param {Object} folder - The folder whose content is being analyzed
 * @param {number} threshold - Threshold value that determines what percentage of files count as a majority
 */
async function deviantPermissionAnalysis(snapshotId, folder, threshold) {
    try {
        // Retrieve children of the folder
        let children = await File.find({ snapshotId: snapshotId, parent: folder.fileId });
        // Map of file permission string arrays
        const filePermissionMap = new Map();
        // Map of all permissions string arrays found throughout the folder's files
        const overallPermissionMap = new Map();
        // Populating the overall permission map
        for (const file of children) {
            // If the file has no permissions, set its permission string array to an empty and continue with the next file
            if (Object.keys(file.permissions).length === 0) {
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
                if (Object.keys(file.permissions).length === 0) {
                    continue;
                }
                // Permissions exclusive to file
                const fileExclusivePermissions = (filePermissionMap.get(file.fileId)).filter((permission) => !(majorityPermissions.permissions).includes(permission));
                // Permissions exclusive to majority
                const majorityExclusivePermissions = (majorityPermissions.permissions).filter((permission) => !(filePermissionMap.get(file.fileId)).includes(permission));
                // Update deviantPermissions property of file
                if (fileExclusivePermissions.length > 0 || majorityExclusivePermissions.length > 0) {
                    const updatedFile = await File.findOneAndUpdate({ snapshotId: snapshotId, fileId: file.fileId }, { $set:{ deviantPermissions: { 'fileExclusivePermissions': fileExclusivePermissions, 'majorityExclusivePermissions': majorityExclusivePermissions } } });
                    console.log(`Added deviantPermissions for File '${updatedFile.fileId}'.`);
                }
            }
        }
    } catch (error) {
        throw new Error(`Failed to analyze deviant permissions for folder '${folder.fileId}'. ${error}`);
    }   
}

/**
 * Creates a map-like object of all files associated with a given file snapshot
 * @param {Object[]} fileList - Array of all files associated with the given snapshot
 * @returns {Object} map - Map of all files present in the user's drive at the time the snapshot was taken
 */
function createFileMap(fileList) {
    // Map object storing all files in the snapshot
    const map = new Map();
    // Insert the files into the map
    for (const file of fileList) {
        map.set(file.fileId, file);
    }
    // Return the map of files
    return map;
}

// Identifies file sharing differences between two FileSnapshots
async function snapshotAnalysis(req, res) {
    // Retrieve snapshot Ids from request
    const { snapshot1, snapshot2 } = req.params;
    try {
        // Retrieve all files (excluding root folders) associated with the selected file snapshots
        const snapshot1FileList = await File.find({ snapshotId: snapshot1, root: false });
        const snapshot2FileList = await File.find({ snapshotId: snapshot2, root: false });
        // Create file maps from the retrieved files
        const snapshot1Map = createFileMap(snapshot1FileList);
        // List of new files (files that exist in the second snapshot, but not in the first)
        let newFiles = [];
        // Object storing the differences in file sharing permissions between the two snapshots
        let permissionDifferences = {};
        // Iterate through the files of the second file snapshot
        for (const file of snapshot2FileList) {
            // If the file is not in the first snapshot, label it as a new file in the second snapshot
            if (!snapshot1Map.has(file.fileId)) {
                newFiles.push(file);
                continue;
            }
            // If the file is found exists in both snapshots, compare file sharing permissions
            const fileDifferences = compareFiles(snapshot1Map.get(file.fileId), file);
            const snapshot1ExclusivePermissions = fileDifferences[0];
            const snapshot2ExclusivePermissions = fileDifferences[1];
            // If there are any differences in the file's permissions between the two snapshots, add these differences to the sharing differences object
            if (snapshot1ExclusivePermissions.length > 0 || snapshot2ExclusivePermissions.length > 0) {
                permissionDifferences[file.fileId] = [snapshot1ExclusivePermissions, snapshot2ExclusivePermissions];
                console.log(`Found snapshot sharing differences for file (${file.fileId})`);
            }
        }
        // Return the file sharing differences between the two snapshots as an object
        const sharingDifferences = { 'newFiles': newFiles, 'permissionDifferences': permissionDifferences };
        res.status(200).json({ success: true, differences: sharingDifferences });
    } catch(error) {
        console.error(`Failed to analyze snapshots: ${error}`);
        res.status(400).json({ success: false, error: error });
    }
}

module.exports = {
    sharingAnalysis,
    snapshotAnalysis
};