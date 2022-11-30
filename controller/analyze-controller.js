// Local imports
const File = require('../models/file-model');
const User = require('../models/user-model');

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
 * Identifies differences in file sharing permissions given a file and its parent
 * @param {Object} file - The file whose file sharing permissions are being analyzed
 * @param {Object} folder - The parent folder whose file sharing permissions are being analyzed
 * @returns {Object} differences - Object containing the file's path (by name) and each file's exclusive permissions
 */
function identifyFileFolderDifferences(file, folder) {
    // Identify differences in sharing permissions between the file and folder
    const fileDifferences = compareFiles(file, folder);
    const fileExclusivePermissions = fileDifferences[0];
    const folderExclusivePermissions = fileDifferences[1];
    // Return results of fileFolderDifferences analysis for the file
    return { path: file.path.name + file.name, fileFolderDifferences: { fileExclusivePermissions: fileExclusivePermissions, folderExclusivePermissions: folderExclusivePermissions } };
}

// Retrieves a list of file-folder differences for all files in the user's drives
async function analyzeFileFolderDifferences(req, res) {
    const  { snapshotId } = req.params;
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
        // Retrieve all non-root-folder folder files in the snapshot
        let folders = await File.find({ snapshotId: snapshotId, children: { $ne: null } });
        // Perform sharing analysis on each of the folders
        let analysis = await Promise.all(folders.map(async function (folder) {
            // Retrieve children of folder
            let children = await File.find({ snapshotId: snapshotId, parent: folder.fileId });
            // Perform file-folder difference analysis on non-root folders
            if (!folder.root) {
                // Array containing file-folder differences of each file in the folder
                const folderAnalysis = [];
                // For-loop to identify file-folder differences of each file in the folder
                for (const file of children) {
                    // Identify differences in the sharing permissions between the file and folder
                    const fileAnalysis = identifyFileFolderDifferences(file, folder);
                    // If there are file-folder differences, add them to the folder analysis array
                    if (fileAnalysis.fileFolderDifferences.fileExclusivePermissions.length > 0 || fileAnalysis.fileFolderDifferences.folderExclusivePermissions.length > 0) {
                        folderAnalysis.push(fileAnalysis);
                        console.log(`File-folder differences found for file '${file.fileId}'.`);
                    }
                }
                // Return null if the folder does not have any file-folder differences
                if (folderAnalysis.length === 0) {
                    return null
                }
                return folderAnalysis;
            }
        }));
        // Filter out folder analysis arrays that are null
        analysis = analysis.filter((folderAnalysis) => folderAnalysis);
        // Concatenate all folder analysis arrays
        analysis = [].concat(...analysis);
        console.log(`File-folder differences analysis completed for FileSnapshot '${snapshotId}'.`);
        res.status(200).json({ success: true, analysis: analysis });
    } catch (error) {
        console.error(`Failed to analyze File-folder differences for FileSnasphot '${snapshotId}'. ${error}`);
        res.status(400).json({ success: false, error: error });
    }
}

/**
 * Identifies file sharing permissions that deviate from those found in the majority of files given a folder and a deviance threshold
 * @param {Object} folder - The folder whose children files are going to be analyzed 
 * @param {number} threshold - Integer value >= 0.51 that determines which file sharing permissions are part of the majority group based on their number of appearance
 * @returns {Object[]} differences - Object containing the deviant permissions of each file in the folder
 */
async function identifyDeviantPermissions(folder, threshold) {
    try {
        // Retrieve all children of the folder
        let children = await File.find({ snapshotId: folder.snapshotId, parent: folder.fileId });
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
            let permissionSet = overallPermissionMap.get(combinedString);
            if (permissionSet) {
                overallPermissionMap.set(combinedString, { ...permissionSet, count: permissionSet.count+1 });
            } else {
                overallPermissionMap.set(combinedString, { permissions: permissions, count: 1 });
            }
        }
        // Determine which permissions belong to the file 'majority' dictated by the user's threshold value
        let majorityPermissionSet = Object.values(Object.fromEntries(overallPermissionMap)).find(value => value.count / children.length >= threshold);
        // Identify which of the files' permissions deviate from those found in the majority of files
        if (majorityPermissionSet) {
            // Array containing the deviant permissions of each file in the folder
            let analysis = [];
            // For-loop to identify deviant permissions of each file in the folder
            for (const file of children) {
                // Continue the loop if the file does not have any permissions
                if (Object.keys(file.permissions).length === 0) {
                    continue;
                }
                // Permissions exclusive to the file
                const fileExclusivePermissions = (filePermissionMap.get(file.fileId)).filter((permission) => !(majorityPermissionSet.permissions).includes(permission));
                // Permissions exclusive to the majority permission set
                const majorityExclusivePermissions = (majorityPermissionSet.permissions).filter((permission) => !(filePermissionMap.get(file.fileId)).includes(permission));
                // If the file's permission deviate from that of the majority permission set, add its deviation to the folder analysis array
                if (fileExclusivePermissions.length > 0 || majorityExclusivePermissions.length > 0) {
                    analysis.push({ path: file.path.name + file.name, fileMajorityDifferences: { fileExclusivePermissions: fileExclusivePermissions, majorityExclusivePermissions: majorityExclusivePermissions } });
                    console.log(`Deviant permissions found for file '${file.fileId}'.`);
                }
            }
            // Return null if there are no deviant permissions for any files in the folder
            if (analysis.length === 0) {
                return null;
            }
            return analysis;
        }
        return null;
    } catch (error) {
        throw new Error(`Failed to analyze deviant permissions for folder '${folder.fileId}'. ${error}`);
    }
}

// Retrieve a list of deviant permissions for all files in the user's drive
async function analyzeDeviantPermissions(req, res) {
    // Retrieve FileSnapshotId and deviance threshold from request
    const { snapshotId } = req.params;
    const threshold = req.body.threshold;
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
        // Retrieve all non-root-folder folder files in the snapshot
        let folders = await File.find({ snapshotId: snapshotId, children: { $ne: null } });
        // Perform sharing analysis on each of the folders
        let analysis = await Promise.all(folders.map(async (folder) => await identifyDeviantPermissions(folder, threshold)));
        // Filter out folder analysis arrays that are null
        analysis = analysis.filter((folderAnalysis) => folderAnalysis);
        // Concatenate all folder analysis arrays
        analysis = [].concat(...analysis);
        console.log(`Deviant permission analysis completed for FileSnapshot '${snapshotId}' with threshold value ${threshold}.`);
        res.status(200).json({ success: true, analysis: analysis });
    } catch (error) {
        console.error(`Failed to analyze deviant permissions for FileSnapshot '${snapshotId}'. ${error}`);
        res.status(400).json({ success: false, error: error });
    }
}

/**
 * Creates a map-like object of all files associated with a given file snapshot
 * @param {Object[]} files - List of all files associated with the given snapshot
 * @returns {Object} map - Map of all files present in the user's drive at the time the snapshot was taken
 */
 function createFileMap(files) {
    // Map object storing all files in the snapshot
    const map = new Map();
    // Insert the files into the map
    for (const file of files) {
        map.set(file.fileId, file);
    }
    // Return the map of files
    return map;
}

// Identifies file sharing differences between two FileSnapshots
async function analyzeSnapshots(req, res) {
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
                console.log(`Found new file '${file.fileId}' in FileSnapshot '${snapshot2}'.`);
                continue;
            }
            // If the file is found exists in both snapshots, compare file sharing permissions
            const fileDifferences = compareFiles(snapshot1Map.get(file.fileId), file);
            const snapshot1ExclusivePermissions = fileDifferences[0];
            const snapshot2ExclusivePermissions = fileDifferences[1];
            // If there are any differences in the file's permissions between the two snapshots, add these differences to the sharing differences object
            if (snapshot1ExclusivePermissions.length > 0 || snapshot2ExclusivePermissions.length > 0) {
                permissionDifferences[file.fileId] = [snapshot1ExclusivePermissions, snapshot2ExclusivePermissions];
                console.log(`Found file sharing differences for file (${file.fileId}).`);
            }
        }
        console.log(`Snapshot analysis completed for FileSnapshots '${snapshot1}' and '${snapshot2}'.`)
        // Return the file sharing differences between the two snapshots as an object
        const sharingDifferences = { 'newFiles': newFiles, 'permissionDifferences': permissionDifferences };
        res.status(200).json({ success: true, analysis: sharingDifferences });
    } catch(error) {
        console.error(`Failed to analyze sharing differences for snapshots '${snapshot1}' and '${snapshot2}'. ${error}`);
        res.status(400).json({ success: false, error: error });
    }
}

module.exports = {
    analyzeDeviantPermissions,
    analyzeFileFolderDifferences,
    analyzeSnapshots
};