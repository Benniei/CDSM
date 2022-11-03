// Local imports
const Analyze = require('./analyze-controller');
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');

// Import modules
const { google } = require('googleapis');
const moment = require('moment');

// Create a snapshot of the user's current drive
createFileSnapshot = async function(req, res) {
    try {
        let user = req.user;
        // Create OAuth 2.0 Client for use with Google Drive API
        const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.CLIENT_BASE_URL}auth/google/callback`);
        // Retrieve access token from Google using refresh token to authorize OAuth 2.0 Client
        oauth2Client.setCredentials({ refresh_token: user.refreshToken });
        const accessToken = await oauth2Client.getAccessToken();
        oauth2Client.setCredentials({ access_token: accessToken, refresh_token: user.refreshToken });
        // Initialize Google Drive API
        const driveAPI = google.drive({ version: 'v3', auth: oauth2Client });
        // Retrieve the name and Ids of all of the user's drives
        const driveIds = await getDrives(driveAPI);
        // Retrieve a map of all files in the user's drives
        const driveMap = await getFiles(driveAPI, driveIds);
        // Create a File Snapshot in our database to obtain a snapshotId
        const newSnapshot = new FileSnapshot({
            owner: req.user.id,
            snapshotId: req.user.id + '-' + moment().format('MMMM Do YYYY, H:mm:ss'),
            driveIds: driveIds
        });
        await FileSnapshot.create(newSnapshot);
        console.log(`Added FileSnapshot (${newSnapshot.snapshotId}) to database`); 
        // Retrieve the File Snapshot's snapshotId
        snapshotId = newSnapshot.snapshotId;
        // Create a File Document for each file in the user's drive
        await Promise.all(Object.values(Object.fromEntries(driveMap)).map(async (file) => {
            const newFile = new File({
                snapshotId: newSnapshot.snapshotId,
                fileId: file.id,
                name: file.name,
                driveId: file.driveId,
                path: file.path,
                owner: file.owners,
                creator: file.owners,
                sharingUser: file.sharingUser,
                root: file.root,
                parent: file.parents,
                children: file.children,
                permissions: file.permissions,
                permissionIds: file.permissionIds,
                lastModifiedTime: file.modifiedTime,
            });
            await File.create(newFile);
            console.log(`Added File (${newFile.fileId}) to database`);
        }));

        // Perform sharing analysis on the newly created snapshot
        // Analyze.sharingAnalysis(snapshotId, driveMap, req.user.threshold);

        // Add the FileSnapshot as the user's most recent FileSnapshot
        if (user.filesnapshot) {
            user.filesnapshot.unshift(snapshotId);
        } else {
            user.filesnapshot = [snapshotId];
        }     
        user.save();
        // Send the newly created FileSnapshot's id and owner to the client
        res.status(200).json({ success: true, fileSnapshot: newSnapshot }); 
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
};

/**
 * Retrieves a list of all of the user's drives
 * @param {Object} driveAPI - Instance of Google Drive API service
 * @returns {Object} driveIds - Name and Ids of all of the user's drives 
 */
getDrives = async function(driveAPI) {
    // Object to store fileIds of all drives' root folder
    let driveIds = {};
    // Retrieve root folder of user's 'My Drive' collection
    const rootFolder = await driveAPI.files.get({ fileId: 'root' });
    // List of drives retrieved from Google Drive API
    let driveList = [{ id: rootFolder.data.id, name: 'MyDrive' }, { id: 'SharedWithMe', name: 'SharedWithMe' }];
    // Termination condition of do-while loop, loops until there are no more drives to be retrieved
    let pageToken = '';
    // Do-while-loop to retrieve all of the user's drives
    do {
        console.log('Retrieving drives from page...');
        // Request shared drive data for 10 files
        const response = await driveAPI.drives.list({
            pageSize: 10
        });
        // If files are retrieved, append them to the list of shared drives
        if (response.data.drives.length > 0) {
            driveList = [...driveList, ...response.data.drives];
        }
        // Update next page token
        pageToken = response.data.nextPageToken;
    } while(pageToken);
    // Log file data
    console.log(`Retrieived ${driveList.length} drives`);
    // Add each shared drive's Id and name into driveId object
    for (const drive of driveList) {
        driveIds[drive.id] = drive.name;
    }
    return driveIds;
}

/**
 * Retrieves all files from the user's drives
 * @param {Object} driveAPI - Instance of Google Drive API service
 * @param {Object} driveIds - Name and Ids of all of the user's drives
 * @returns {Map} map - Map of all files in the user's drives
 */
getFiles = async function(driveAPI, driveIds) {
    // List of files retrieved from Google Drive API (including root folder of the user's 'My Drive' collection)
    let fileList = [];
    // Add each shared drive's Id and name into driveId object
    for (const drive of Object.keys(driveIds)) {
        fileList.push({ id: drive, name: driveIds[drive], mimeType: 'application/vnd.google-apps.folder', root: true, children: [] });
    }
    // Next page token to loop file request
    let pageToken = '';
    // Do-while-loop to retrieve all files in user's drive
    do {
        console.log('Retrieving files from page...');
        // Request file data for 1000 files
        const response = await driveAPI.files.list({
            q: "trashed = false and mimeType!='application/vnd.google-apps.shortcut'",                                                                       // "trashed = false": exclude files that are in the trash, "mimeType!='application/vnd.google-apps.shortcut'": exclude google drive shortcuts links
            pageSize: 1000,                                                                                                                                  // Number of files to retrieve at once (per page)
            supportsAllDrives: true,                                                                                                                         // Whether response supports shared drives
            includeItemsFromAllDrives: true,                                                                                                                 // Whether response should include shared drive files
            fields: 'nextPageToken, files(id, driveId, mimeType, modifiedTime, name, ownedByMe, owners, parents, permissionIds, permissions, sharingUser)'   // 'nextPageToken': if there are more files to retrieved, 'files(...)': file fields/properties to retrieve
        });
        // If files are retrieved, append them to the array of retrieved files
        if (response.data.files.length > 0) {
            fileList = [...fileList, ...response.data.files];
        }
        // Update next page token
        pageToken = response.data.nextPageToken;
    } while(pageToken);
    // Log file data
    console.log(`Retrieived ${fileList.length} files`);
    // Return map of all files in the user's drives
    return createFileMap(driveIds, fileList);
}

/**
 * Creates a map-like object of all files in the user's drives
 * @param {Object} driveIds - The name and Ids of all of the user's drives
 * @param {Objectp[]} fileList - Array of file objects
 * @returns {Map} map - Map of all files in the user's drives
 */
createFileMap = function(driveIds, fileList) {
    // Map object used to store the files
    const map = new Map();
    // Insert the files into map
    for (const file of fileList) {
        // Object containing file field overrides
        let overrides = {};
        // If the file has a parent folder, list it as a child of the parent folder
        if (file.parents) {
            // Replace the file's parents array with a string
            overrides['parents'] = file.parents[0];
            // If the parent already has an entry in the map, add the file to the parent entry's children array
            if (map.get(file.parents[0])) {
                let parent = map.get(file.parents[0]);
                map.set(parent.id, { ...parent, children: [...parent.children, file.id] });
            }
            // Otherwise, create an entry for the parent folder and add the file to its children array
            else {
                let data = { id: file.parents[0], mimeType: 'application/vnd.google-apps.folder', children: [file.id] };
                map.set(file.parents[0], data);
            }
        }
        // Replace the file's owners array with only the owner's email address
        if (file.owners) {
            overrides['owners'] = file.owners[0].emailAddress;
        }
        // Replace the file's permission array with an object
        if (file.permissions) {
            overrides['permissions'] = createPermissionObject(file.permissions);
        }
        // Replace the file's owners array with only the owner's email address
        if (file.sharingUser) {
            overrides['sharingUser'] = file.sharingUser.emailAddress;
        }
        // Update the file's 'driveId' field if the file is part of the user's 'My Drive' or 'Shared with me' file collections
        if (!file.driveId && !file.root) {
            // File is part of the 'My Drive' file collection
            if (file.ownedByMe) {
                // Find driveId for 'My Drive' file collection
                overrides['driveId'] = Object.keys(driveIds).find(key => driveIds[key] === 'MyDrive');
            }
            // File is part of the 'Shared With Me' file collection
            else {
                overrides['driveId'] = 'SharedWithMe';
                // Set Parent to 'SharedWithMe' root folder if one doesn't exist
                if (!file.parents) {
                    overrides['parents'] = 'SharedWithMe';
                    // Add file as a child of the 'Shared With Me' file collection
                    let parent = map.get('SharedWithMe');
                    map.set(parent.id, { ...parent, children: [...parent.children, file.id] });
                }
            }
        }
        // If the file already has an entry in the map (because it's the parent folder of some file that was already added into the map), update the entry with the file's other fields (parents, permissions, etc.)
        if (map.get(file.id)) { 
            map.set(file.id, { ...map.get(file.id), ...file, ...overrides });
        }
        // Otherwise, create an entry for the file
        else {
            // If the file is a folder, add an empty children array property
            if (file.mimeType == 'application/vnd.google-apps.folder') {
                overrides['children'] = [];
            }
            map.set(file.id, { ...file, ...overrides });
        }
    }
    // Update each entry in the map with the file's path
    for (const file of fileList) {
        getPath(map.get(file.id), map);
    }
    // Return the map of drive files
    return map;
    // return Object.fromEntries(map);
};

/**
 * Converts an array of permissions into an object
 * @param {Object[]} permissionList - An list of Google Drive permission objects
 * @returns {Object} permissions - An object containing all of the file's permissions
 */
createPermissionObject = function(permissionList) {
    // Objectbject to store the permissions of a file
    const permissions = {};
    // Insert the permissions into permission map using map method
    for (const permission of permissionList) {
        permissions[permission.id] = permission;
    }
    return permissions;
};

/**
 * Recursively retrieves the file's path from the drive's root folder
 * @param {Object} file - The file who's path is being returned
 * @param {Object} end - The file who originally called getPath()
 * @param {Map} map - Map of all files in the user's drives
 * @returns {string} path - The path of the file from the drive's root folder
 */
getPath = function(file, map) {
    // Have root folders return their fileId
    if (!file.parents) {
    //   return `/${file.id}/`;
        return `/${file.name}/`
    }
    // If a file has a path, return it
    if (file.path) {
      return file.path;
    }
    // Parent of file
    const parent = map.get(file.parents);
    // Otherwise, create a path using the file's parent folder's path
    let path = getPath(parent, map);
    // If the file's parent is not a root folder, add its parent's name to the path
    if (parent.mimeType == 'application/vnd.google-apps.folder' && !parent.root) {
        // path += `${file.id}/`;
        path += `${parent.name}/`;
    }
    // If the file's map entry does not a path property set, add it 
    if (!map.get(file.id).path) {
        map.set(file.id, { ...map.get(file.id), path: path });
    }
    // Return path of file
    return path;
};

module.exports = {
    createFileSnapshot
};