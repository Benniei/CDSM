// Local imports
const Analyze = require('./analyze-controller');
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Import modules
const { google } = require('googleapis');
const moment = require('moment');

// Create a snapshot of the user's current drive
createFileSnapshot = async function(req, res) {
    try {
        // Check if user is authenticated with Google
        if (req.user && req.user.cloudProvider == 'google') {
            // Retrieve User refreshToken from database
            const user = await User.findById(req.user.id, { _id: 0, refreshToken: 1 });
            if (!user) {
                throw new Error('Could not find User in database.');
            }
            // Map-like object of all files in the user's drive
            const myDrive = await getMyDrive(user.refreshToken);
            // Create a File Snapshot in our database to obtain a snapshotId
            const newSnapshot = new FileSnapshot({
                owner: req.user.id,
                snapshotId: req.user.id + '-' + moment().format('MMMM Do YYYY, H:mm:ss'),
                myDrive: myDrive
            });
            await FileSnapshot.create(newSnapshot);
            console.log(`Added FileSnapshot (${newSnapshot.snapshotId}) to database`); 
            // Retrieve the File Snapshot's snapshotId
            snapshotId = newSnapshot.snapshotId;
            // Create a File Document for each file in the user's drive
            for (let file in myDrive) {
                const newFile = new File({
                    snapshotId: snapshotId,
                    fileId: file,
                    name: myDrive[file].name,
                    driveId: 'My Drive',
                    path: myDrive[file].path,
                    root: myDrive[file].root,
                    parents: myDrive[file].parents,
                    children: myDrive[file].children,
                    owners: myDrive[file].owners,
                    permissions: myDrive[file].permissions,
                    permissionIds: myDrive[file].permissionIds,
                    lastModifiedTime: myDrive[file].modifiedTime
                });
                await File.create(newFile);
                console.log(`Added File (${newFile.fileId}) to database`); 
            }
            // Send the newly created FileSnapshot's id and owner to the client
            res.status(200).json({ success: true, fileSnapshot: newSnapshot });
            // Perform sharing analysis on the newly created snapshot
            Analyze.sharingAnalysis(snapshotId, req.user.threshold);
        } else {
            res.status(403).json({ success: false, error: 'Unauthorized.' });
            throw new Error('Unauthorized User.');
        }
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
};

// Retrieves all files in the user's 'My Drive'
getMyDrive = async function(token) {
    // Create OAuth 2.0 Client for use with Google Drive
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.CLIENT_BASE_URL}auth/google/callback`);
    // Retrieve access token from Google using refresh token to authorize OAuth 2.0 Client
    oauth2Client.setCredentials({ refresh_token: token });
    const accessToken = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: token });
    // Initialize Google Drive API
    const driveAPI = google.drive({ version: 'v3', auth: oauth2Client });
    // Retrieve root folder of user's drive
    const rootFolder = await driveAPI.files.get({ fileId: 'root' });
    // Array of files in the user's drive + root folder
    let fileList = [{ id: rootFolder.data.id, name: rootFolder.data.name, mimeType: rootFolder.data.mimeType, root: true, children: [] }];
    // Variable containing next page token
    let pageToken = '';
    // Do-while loop to retrieve all files in user's drive
    do {
        console.log('Retrieving files from page...');
        // Request file data for 1000 files
        const response = await driveAPI.files.list({
            q: "'me' in owners and trashed = false and mimeType!='application/vnd.google-apps.shortcut'",                   // "'me' in owners": retrieve files owned by the owner, "trashed = false": exclude files that are in the trash, "mimeType!='application/vnd.google-apps.shortcut'": exclude google drive shortcuts links
            pageSize: 1000,                                                                                                 // Number of files to retrieve at once
            orderBy: 'folder desc',                                                                                         // Order retrieve files by folder (descending order)
            fields: 'nextPageToken, files(id, mimeType, modifiedTime, name, owners, parents, permissionIds, permissions)'   // 'nextPageToken': if there are more files to retrieved, 'files(...)': file fields/properties to retrieve
        });
        // If files are retrieved, append them to the file list array
        if (response.data.files.length > 0) {
            fileList = [...fileList, ...response.data.files];
        }
        // Update next page token
        pageToken = response.data.nextPageToken;
    } while(pageToken);
    // Log file data
    console.log(`Retrieived ${fileList.length} files`);
    // Return the list of files as a map-like object
    return createFileMap(fileList);
};

// Create a map-like object from an array of files as well as an array of file Ids
createFileMap = function(fileList) {
    // Map object to store the files of a drive
    const map = new Map();
    // Insert the files into drive map using map method
    fileList.forEach((file) => {
        // Check if the file has a parent folder
        if (file.parents) {
            // Check if the parent folder has an entry in the drive map
            if (map.get(file.parents[0])) {
                // If one exists, add the file to the folder's children array
                let folder = map.get(file.parents[0]);
                map.set(folder.id, { ...folder, children: [...folder.children, file.id] });
            } else {
                // Otherwise, create an entry and add the file to the children array
                let data = { id: file.parents[0], mimeType: 'application/vnd.google-apps.folder', children: [file.id] };
                map.set(file.parents[0], data);
            }
        }
        // Check if the file already has an entry in the drive map
        if (map.get(file.id)) {
            // If one exists, update the entry with the folder's other fields (parents, permissions, etc.)
            map.set(file.id, { ...map.get(file.id), ...file });
        } else {
            // Otherwise, create an entry (with an empty children array if the file is a folder)
            let data = file;
            if (file.mimeType == 'application/vnd.google-apps.folder') {
                data = { ...file, children: [] };
            }
            map.set(file.id, data);
        }
        // Replace the file's permission array with a map-like object if it has one
        if (file.permissions) {
            map.set(file.id, { ...map.get(file.id), permissions: createPermissionMap(file.permissions)});
        }
        // Set root property to false if not a root folder
        if (!file.root) {
            map.set(file.id, { ...map.get(file.id), root: false });
        }
    });
    // Update each entry in the map with the file's path
    fileList.forEach((file) => {
        getPath(file, map);
    });
    // Return the drive map as a standard object and the array of file Ids
    return Object.fromEntries(map);
};

// Recursively retrieve a path using parent folders and a map
getPath = function(file, map) {
    // Have root folder return its fileId
    if (!file.parents) {
      return `/${file.id}/`;
    }
    // Return path of file if it has one
    if (file.path) {
      return file.path;
    }
    // Otherwise, create a path using the file's parent folder
    let path = getPath(map.get(file.parents[0]), map);
    // Append fileId to path if file is a folder
    if (file.mimeType == 'application/vnd.google-apps.folder') {
        path += `${file.id}/`;
    }
    // Set path property in map entry
    map.set(file.id, { ...map.get(file.id), path: path });
    // Return path of file
    return path;
};

// Create a map-like object from an array of permissions
createPermissionMap = function (permissionList) {
    // Map object to store the permissions of a file
    const map = new Map();
    // Insert the permissions into permission map using map method
    permissionList.forEach((permission) => {
        map.set(permission.id, permission);
    });
    // Return the permission map as a standard object
    return Object.fromEntries(map);
};

// Delete all files stored in the database
// deleteFiles = async function(req, res) {
//     await File.deleteMany({});
//     res.send('All files deleted');
// };

module.exports = {
    createFileSnapshot,
    // deleteFiles
};