// Local imports
const Analyze = require('./analyze-controller');
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Import modules
const onedrive = require("onedrive-api");
const moment = require('moment');
const axios = require('axios');

// Create a snapshot of the user's current drive
createFileSnapshot = async function(req, res) {
    try {
        const user = await User.findById(req.userId);
        // Retrieve access token from Microsoft using refresh token
        const accessToken = await getAccessToken(user.refreshToken);
        //oauth2Client.setCredentials({ access_token: accessToken, refresh_token: user.refreshToken });
        // Initialize Google Drive API
        await onedrive.items
        .createFolder({
            accessToken: accessToken,
            rootItemId: "root",
            name: "Folder",
        })
        .then((r) => {
            console.log(r);
        });
        /*const driveAPI = google.drive({ version: 'v3', auth: oauth2Client });
        // Retrieve the name and Ids of all of the user's drives
        const driveIds = await GD_getDrives(driveAPI);
        // Retrieve a map of all files in the user's drives
        const driveMap = await GD_getDriveFiles(driveAPI, driveIds);
        // Create a File Snapshot in our database to obtain a snapshotId
        const newSnapshot = new FileSnapshot({
            owner: user._id,
            snapshotId: user._id + '-' + moment().format('MMMM Do YYYY, H:mm:ss'),
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
                permissionsRaw: file.permissionsRaw,
                permissionIds: file.permissionIds,
                lastModifiedTime: file.modifiedTime,
            });
            await File.create(newFile);
            console.log(`Added File (${newFile.fileId}) to database`);
        }));
        // Perform sharing analysis on the newly created snapshot
        Analyze.sharingAnalysis(snapshotId, user.threshold);
        // Add the FileSnapshot as the user's most recent FileSnapshot
        if (user.filesnapshot) {
            user.filesnapshot.unshift(snapshotId);
        } else {
            user.filesnapshot = [snapshotId];
        }     
        user.save();*/
        // Send the newly created FileSnapshot's id and owner to the client
        res.status(200).json({ success: true/*, fileSnapshot: newSnapshot*/ }); 
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);
        // res.status(400).json({ success: false, error: error });   
    }
};

/**
 * Retrieves a list of all of the user's drives
 * @param {Object} driveAPI - Instance of Google Drive API service
 * @returns {Object} driveIds - Name and Ids of all of the user's drives 
 */
GD_getDrives = async function(driveAPI) {
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
GD_getDriveFiles = async function(driveAPI, driveIds) {
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
    return await GD_createFileMap(driveAPI, driveIds, fileList);
}

/**
 * Creates a map-like object of all files in the user's drives
 * @param {Object} driveAPI - Instance of Google Drive API service
 * @param {Object} driveIds - The name and Ids of all of the user's drives
 * @param {Objectp[]} fileList - Array of file objects
 * @returns {Map} map - Map of all files in the user's drives
 */
GD_createFileMap = async function(driveAPI, driveIds, fileList) {
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
        // Retrieve the file's hidden permissions if it is a Shared Drive file
        if (!file.permissions && !file.root) {
            try {
                const response = await driveAPI.permissions.list({
                    fileId: file.id,
                    supportsAllDrives: true,
                    fields: 'permissions(id, type, role, emailAddress, domain, displayName)'
                });
                file.permissions = response.data.permissions;
                console.log(`Retrieved hidden permissions for file ${file.id}`);
            } catch(error) {
                console.error(`User did not have sufficient permission to access the hidden permissions for this file (${file.id}).`);
            }
        }
        // Replace the file's permission array with an object
        if (file.permissions) {
            const permissionObjects = GD_createPermissionObject(file.permissions);
            overrides['permissions'] = permissionObjects.permissions;
            overrides['permissionsRaw'] = permissionObjects.permissionsRaw;
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
};

/**
 * Converts an array of permissions into an object
 * @param {Object[]} permissionList - An list of Google Drive permission objects
 * @returns {Object} permissions - Objects containing all of the file's permissions as strings and objects
 */
GD_createPermissionObject = function(permissionList) {
    // Object to store the permissions of a file
    const permissions = {};
    const permissionsRaw = {};
    // Insert the permissions into permission object as '(type, emailAddress/domain, role)' values
    for (const permission of permissionList) {
        switch(permission.type) {
            // Files shared to individual users or groups have email addresses
            case 'user' || 'group':
                permissions[permission.id] = `(${permission.type}, ${permission.emailAddress}, ${permission.role})`;
                break;
            // Files shared with a domain have domain addresses
            case 'domain':
                permissions[permission.id] = `(domain, ${permission.domain}, ${permission.role})`;
                break;
            // Files shared via links do not have email or domain addresses
            default:
                permissions[permission.id] = `(anyone, ${permission.role})`;
        }
        // Remove unnecessary data from Google Drive API permission objects
        permissionsRaw[permission.id] = { id: permission.id, type: permission.type, emailAddress: permission.emailAddress, domain: permission.domain, role: permission.role, displayName: permission.displayName };
    }
    return { permissions: permissions, permissionsRaw: permissionsRaw };
};

/**
 * Recursively retrieves the file's path from the drive's root folder
 * @param {Object} file - The file who's path is being returned
 * @param {Object} end - The file who originally called getPath()
 * @param {Map} map - Map of all files in the user's drives
 * @returns {Object} path - The path (by fileId and name) of the file from the drive's root folder
 */
getPath = function(file, map) {
    // Have root folders return their fileId/name
    if (!file.parents) {
        return { id: `/${file.id}/`, name: `/${file.name}/` };
    }
    // If a file has a path, return it
    if (file.path) {
      return file.path;
    }
    // Parent of file
    const parent = map.get(file.parents);
    // Otherwise, create a path using the file's parent folder's path
    let path = getPath(parent, map);
    // If the file's parent is not a root folder, add its parent's fileId/name to the path
    if (parent.mimeType == 'application/vnd.google-apps.folder' && !parent.root) {
        path = { id: path.id + `${parent.id}/`, name: path.name + `${parent.name}/` };
    }
    // If the file's map entry does not a path property, add the file's path 
    if (!map.get(file.id).path) {
        map.set(file.id, { ...map.get(file.id), path: path });
    }
    // Return path of file
    return path;
};

/**
 * Calls the endpoint with authorization bearer token.
 * @param {string} refreshToken
 */
 getAccessToken = async function(refreshToken) {
    const body =  {
        client_id: `${process.env.ONEDRIVE_CLIENT_ID}`, 
        scope: ['user.read', 'Files.read', 'offline_access'],
        refresh_token: `${refreshToken}`,
        grant_type: `refresh_token`,
        client_secret: `${process.env.ONEDRIVE_CLIENT_SECRET}`
    };
   
    const options = {
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    };

    const endpoint = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

    try {
        const response = await axios.post(endpoint, body, options);
        return response.data.access_token;
    } catch (error) {
        // console.log(error)
        return error;
    }
};

module.exports = {
    createFileSnapshot
};