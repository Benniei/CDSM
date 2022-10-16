// Local imports
const User = require('../models/user-model');

// Import modules
const express = require('express');
const { google } = require('googleapis');

// Create router instance
const router = express.Router();

// Retrieves file data for all files in user's drive
// router.get('/getfiles', async function(req, res, next) {
//     try {
//         // Check if user is authenticated with Google
//         if (req.user && req.user.cloudProvider == 'google') {
//             // Retrieve User refreshToken from database
//             const user = await User.findById(req.user.id, { _id: 0, refreshToken: 1 });
//             if (!user) {
//                 console.error('User not in database.');
//                 return;
//             }
//             // Create OAuth 2.0 Client for use with Google Drive
//             const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.CLIENT_BASE_URL}auth/google/callback`);
//             // Retrieve access token from Google using refresh token to authorize OAuth 2.0 Client
//             oauth2Client.setCredentials({ refresh_token: user.refreshToken });
//             const accessToken = await oauth2Client.getAccessToken();
//             oauth2Client.setCredentials({ access_token: accessToken, refresh_token: user.refreshToken });
//             // Initialize Google Drive API
//             const drive = google.drive({ version: 'v3', auth: oauth2Client });
//             // Array of files in user's drive
//             let fileList = [];
//             // Variable containing next page token
//             let pageToken = '';
//             // Do-while loop to retrieve all files in user's drive
//             do {
//                 console.log('Retrieving files from page...');
//                 // Request file data for 1000 files
//                 const response = await drive.files.list({
//                     pageSize: 1000,                      // Number of files to retrieve at once
//                     orderBy: 'folder',                   // Order retrieve files by folder
//                     fields: 'nextPageToken, files(*)'    // 'nextPageToken': if there are more files not retrieved, 'files(*)': get all file fields/properties
//                 });
//                 // If files are retrieved, append them to the file list array
//                 if (response.data.files.length > 0) {
//                     fileList = [...fileList, ...response.data.files];
//                 }
//                 // Update next page token
//                 pageToken = response.data.nextPageToken;
//             } while(pageToken);
//             // Log file data
//             console.log(`Retrieived ${fileList.length} files`);
//             fileList.map((file) => {
//                 console.log(file);
//             });
//         } else {
//             console.error('User is not authenticated.');
//         }
//     } catch(error) {
//         console.error(error);
//     }
// });

module.exports = router;