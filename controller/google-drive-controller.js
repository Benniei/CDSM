// Local imports
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
            const driveFiles = await getMyDrive(user.refreshToken);
            const myDrive = driveFiles[0];
            const fileIds = driveFiles[1];
            // Create a File Snapshot in our database to obtain a snapshotId
            const newSnapshot = new FileSnapshot({
                owner: req.user.id,
                snapshotId: req.user.id + '-' + moment().format('MMMM Do YYYY, H:mm:ss'),
                myDrive: fileIds
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
            return res.status(200).json({ success: true, fileSnapshot: newSnapshot });
        } else {
            res.status(403).json({ success: false, error: 'Unauthorized.' });
            throw new Error('Unauthorized User.');
        }
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);   
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
    // Array to store the drive's file Ids
    const fileIds = [];
    // Insert the files into drive map using map method
    fileList.map((file) => {
        // Check if the file has a parent folder
        if (file.parents) {
            // Check if the parent folder has an entry in the drive map
            if (map.get(file.parents[0])) {
                // If one exists, add the file to the folder's children array
                folder = map.get(file.parents[0]);
                map.set(folder.id, { ...folder, children: [...folder.children, file.id] });
            } else {
                // Otherwise, create an entry and add the file to the children array
                data = { id: file.parents[0], mimeType: 'application/vnd.google-apps.folder', children: [file.id] };
                map.set(file.parents[0], data);
            }
        }
        // Check if the file already has an entry in the drive map
        if (map.get(file.id)) {
            // If one exists, update the entry with the folder's other fields (parents, permissions, etc.)
            folder = map.get(file.id);
            map.set(file.id, { ...folder, ...file });
            fileIds.push(file.id);
        } else {
            // Otherwise, create an entry (with an empty children array if the file is a folder)
            data = file;
            if (file.mimeType == 'application/vnd.google-apps.folder') {
                data = { ...file, children: [] };
            }
            map.set(file.id, data);
            fileIds.push(file.id);
        }
    });
    // Return the drive Map as a standard object and the array of file Ids
    return [Object.fromEntries(map), fileIds];
};

// deleteFiles = async function(req, res) {
//     await File.deleteMany({});
//     res.send('All files deleted');
// }

module.exports = {
    createFileSnapshot,
    //deleteFiles
};