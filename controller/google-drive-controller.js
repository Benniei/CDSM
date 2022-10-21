// Local imports
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Import modules
const { google } = require('googleapis');
const moment = require('moment');

// Retrieves file data for all files in user's drive
getFiles = async function(req, res) {
    try {
        // Check if user is authenticated with Google
        if (req.user && req.user.cloudProvider == 'google') {
            // Retrieve User refreshToken from database
            const user = await User.findById(req.user.id, { _id: 0, refreshToken: 1 });
            if (!user) {
                console.error('User not in database.');
                return;
            }
            // Create OAuth 2.0 Client for use with Google Drive
            const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.CLIENT_BASE_URL}auth/google/callback`);
            // Retrieve access token from Google using refresh token to authorize OAuth 2.0 Client
            oauth2Client.setCredentials({ refresh_token: user.refreshToken });
            const accessToken = await oauth2Client.getAccessToken();
            oauth2Client.setCredentials({ access_token: accessToken, refresh_token: user.refreshToken });
            // Initialize Google Drive API
            const driveAPI = google.drive({ version: 'v3', auth: oauth2Client });
            // Array of files in user's drive
            let fileList = [];
            // Variable containing next page token
            let pageToken = '';
            // Do-while loop to retrieve all files in user's drive
            do {
                console.log('Retrieving files from page...');
                // Request file data for 1000 files
                const response = await driveAPI.files.list({
                    pageSize: 1000,                      // Number of files to retrieve at once
                    orderBy: 'folder desc',              // Order retrieve files by folder (descending order)
                    fields: 'nextPageToken, files(id, mimeType, modifiedTime, name, owners, parents, permissionIds, permissions)' // 'nextPageToken': if there are more files to retrieved, 'files(...)': file fields/properties to retrieve
                    // fields: 'nextPageToken, files(*)'    // 'nextPageToken': if there are more files not retrieved, 'files(*)': get all file fields/properties
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
            // Map object to contain files from the user's drive
            const drive = new Map();
            // Insert the files into drive map using map method
            fileList.map((file) => {
                // Check if the file has a parent folder
                if (file.parents) {
                    // Check if the parent folder has an entry in the drive map
                    if (drive.get(file.parents[0])) {
                        // If one exists, add the file to the folder's children array
                        folder = drive.get(file.parents[0]);
                        drive.set(folder.id, { ...folder, children: [...folder.children, file.id] });
                    } else {
                        // Otherwise, create an entry and add the file to the children array
                        data = { id: file.parents[0], mimeType: 'application/vnd.google-apps.folder', children: [file.id] };
                        drive.set(file.parents[0], data);
                    }
                }
                // Check if the file already has an entry in the drive map
                if (drive.get(file.id)) {
                    // If one exists, update the entry with the folder's other fields (parents, permissions, etc.)
                    folder = drive.get(file.id);
                    drive.set(file.id, { ...folder, ...file });
                } else {
                    // Otherwise, create an entry (with an empty children array if the file is a folder)
                    data = file;
                    if (file.mimeType == 'application/vnd.google-apps.folder') {
                        data = { ...file, children: [] };
                    }
                    drive.set(file.id, data);
                }
            });
            // Convert drive Map into an object that can be stored in the database
            const mapObject = Object.fromEntries(drive);
            // Placeholder - Used to convert object back into map
            // const objectMap = new Map(Object.entries(mapObject));
            // Create FileSnapshot document and store it in the database
            const newSnapshot = new FileSnapshot({
                owner: req.user.id,
                snapshotId: req.user.id + '-' + moment().format('MMMM Do YYYY, H:mm:ss'),
                drive: mapObject
            });
            await FileSnapshot.create(newSnapshot);
            console.log(`Added FileSnapshot (${newSnapshot.snapshotId}) to database`);
            res.send(Object.fromEntries(drive));
        } else {
            console.error('User is not authenticated.');
        }
    } catch(error) {
        console.error(error);
    }
};

module.exports = {
    getFiles
};