// Import modules
const { google } = require('googleapis');

/**
 * Return an instance of the Google Drive API service
 * @param {string} refreshToken - Refresh token used to authorize the Google Drive API OAuth 2.0 Client
 * @return {Object} driveAPI - Instance of the Google Drive API service
 */
async function GD_initializeAPI(refreshToken) {
    // Create OAuth 2.0 Client for use with Google Drive API
    const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.CLIENT_BASE_URL}auth/google/callback`);
    // Retrieve access token from Google using refresh token to authorize OAuth 2.0 Client
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const accessToken = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });
    // Initialize the Google Drive API service
    return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Retrieves a list of all of the user's drives
 * @param {Object} driveAPI - Instance of the Google Drive API service
 * @returns {Object} driveIds - The Ids and names of all the user's drives 
 */
async function GD_getDrives(driveAPI) {
    try {
        // Retrieve root folder of user's 'My Drive' collection
        const rootFolder = await driveAPI.files.get({ fileId: 'root' });
        // List of drives retrieved from Google Drive API
        let drives = [{ id: rootFolder.data.id, name: 'MyDrive' }, { id: 'SharedWithMe', name: 'SharedWithMe' }];
        // Termination condition to loop Google Drive API request
        let pageToken = '';
        // Do-while-loop to retrieve drive Ids of all of the user's shared drives
        do {
            // Request drive Ids for up to a maximum of 10 shared drives
            let response;
            if (pageToken === '') {
                response = await driveAPI.drives.list({
                    pageSize: 10,                               // Maximum possible number of shared drives that can be retrieved at once (per page)
                    fields: 'nextPageToken, drives(id, name)'   // 'nextPageToken': whether there are more shared drives yet to be retrieved, 'drives(...)': properties of shared drives on the current page
                });
            } else {
                response = await driveAPI.drives.list({
                    pageSize: 10,                               // Maximum possible number of shared drives that can be retrieved at once (per page)
                    pageToken: pageToken,                       // Pointer to page of shared drives to be retrieved
                    fields: 'nextPageToken, drives(id, name)'   // 'nextPageToken': whether there are more shared drives yet to be retrieved, 'drives(...)': properties of shared drives on the current page
                });
            }
            // If drive data was retrieved, append it to the list of drives
            if (response.data.drives.length > 0) {
                drives = [...drives, ...response.data.drives];
            }
            // Update next page token
            pageToken = response.data.nextPageToken;
        } while (pageToken);
        console.log(`Retrieved drive Ids of ${drives.length - 2} shared drives.`);
        // Object to store the Id of all the user's drives
        let driveIds = {};
        // Add each drive's Id and name as a key-value pair
        for (const drive of drives) {
            driveIds[drive.id] = drive.name;
        }
        return driveIds;
    } catch(error) {
        throw new Error(`Failed to retrieve user's drives. ${error}`);
    }   
}

/**
 * Retrieve the file data of all files in the user's drives
 * @param {Object} driveAPI - Instance of the Google Drive API service
 * @returns {Object[]} files - Array containing the file data of all files in the user's drives
 */
async function GD_getFiles(driveAPI) {
    // Array storing file data retrieved from the Google Drive API
    let files = [];
    // Next page token to loop file request
    let pageToken = '';
    try {
        // Do-while-loop to retrieve all files in user's drive
        do {
            // Request file data for up to a maximum of 1000 files
            let response;
            if (pageToken === '') {
                response = await driveAPI.files.list({
                    q: "trashed = false and mimeType!='application/vnd.google-apps.shortcut'",                                                                       // "trashed = false": exclude files that are in the trash, "mimeType!='application/vnd.google-apps.shortcut'": exclude google drive shortcuts links
                    pageSize: 1000,                                                                                                                                  // Number of files to retrieve at once (per page)
                    supportsAllDrives: true,                                                                                                                         // Whether response supports shared drives
                    includeItemsFromAllDrives: true,                                                                                                                 // Whether response should include shared drive files
                    fields: 'nextPageToken, files(id, driveId, mimeType, modifiedTime, name, ownedByMe, owners, parents, permissionIds, permissions, sharingUser)'   // 'nextPageToken': if there are more files to retrieved, 'files(...)': file fields/properties to retrieve
                });
            } else {
                response = await driveAPI.files.list({
                    q: "trashed = false and mimeType!='application/vnd.google-apps.shortcut'",                                                                       // "trashed = false": exclude files that are in the trash, "mimeType!='application/vnd.google-apps.shortcut'": exclude google drive shortcuts links
                    pageSize: 1000,                                                                                                                                  // Number of files to retrieve at once (per page)
                    pageToken: pageToken,
                    supportsAllDrives: true,                                                                                                                         // Whether response supports shared drives
                    includeItemsFromAllDrives: true,                                                                                                                 // Whether response should include shared drive files
                    fields: 'nextPageToken, files(id, driveId, mimeType, modifiedTime, name, ownedByMe, owners, parents, permissionIds, permissions, sharingUser)'   // 'nextPageToken': if there are more files to retrieved, 'files(...)': file fields/properties to retrieve
                });
            }
            // If file data was retrieved, append it to the list of retrieved files
            if (response.data.files.length > 0) {
                files = [...files, ...response.data.files];
            }
            // Update next page token
            pageToken = response.data.nextPageToken;
        } while (pageToken);
        console.log(`Retrieved file data for ${files.length} files`);
        // Retrieve files' missing permission and permissionId properties
        files = await Promise.all(files.map(async function (file) {
            // If a file is missing sharing permission data, try retrieving it using the Permission resource's native function
            if (!file.permissions) {
                // Array storing the file's sharing permissions
                file.permissions = [];
                // Termination condition to loop Google Drive API request
                let pageToken = '';
                try {
                    // Do-while-loop to retrieve sharing permission data of the file
                    do {
                        // Request permission data for up to a maximum of 100 file sharing permissions
                        if (pageToken === '') {
                            response = await driveAPI.permissions.list({
                                fileId: file.id,                                                                           // The file's unique file Id
                                supportsAllDrives: true,                                                                  // Whether the response supports files from shared drives
                                pageSize: 100,                                                                            // Maximum possible number of permissions that can be retrieved at once (per page)
                                fields: 'nextPageToken, permissions(id, type, emailAddress, domain, role, displayName)'   // 'nextPageToken': whether there are more permissions yet to be retrieved, 'permissions(...)': properties of sharing permissions on the current page
                            });
                        } else {
                            response = await driveAPI.permissions.list({
                                fileId: file.id,                                                                           // The file's unique file Id
                                supportsAllDrives: true,                                                                  // Whether the response supports files from shared drives
                                pageSize: 100,                                                                            // Maximum possible number of permissions that can be retrieved at once (per page)
                                pageToken: pageToken,                                                                     // Pointer to page of permissions to be retrieved
                                fields: 'nextPageToken, permissions(id, type, emailAddress, domain, role, displayName)'   // 'nextPageToken': whether there are more permissions yet to be retrieved, 'permissions(...)': properties of sharing permissions on the current page
                            });
                        }
                        // If permission data was retrieved, append them to the array of retrieved permissions
                        if (response.data.permissions.length > 0) {
                            file.permissions = [...file.permissions, ...response.data.permissions];
                        }
                        // Update next page token
                        pageToken = response.data.nextPageToken;
                    } while (pageToken);
                    console.log(`Retrieived permission data of ${file.permissions.length} permissions for file '${file.id}'.`);
                } catch(error) {
                    console.error(`Failed to retrieve permission data for file '${file.id}'. ${error}`);
                }
            }
            // If the file is missing permissionId data, construct an array of the file permissions' Ids
            if (!file.permissionIds) {
                // Array storing the file permissions' Ids
                file.permissionIds = [];
                // For-loop to iterate over each of the file's permissions
                for (const permission of file.permissions) {
                    file.permissionIds.push(permission.id);
                }
            } 
            // Return the updated file data
            return file;
        }));
    } catch(error) {
        throw new Error(`Failed to retrieve file data. ${error}`);
    }
    // Return the file data retrieved from the Google Drive API
    console.log(files);
    return files;
}

/**
 * Recursively retrieves a file's path from its drive's root folder
 * @param {Object} file - The file who's path is being returned
 * @param {Object} map - Map of all files in the user's drives
 * @returns {Object} path - The path (by fileId and name) of the file from its drive's root folder
 */
function GD_getPath(file, map) {
    // If a file is a root folder, return their fileId and name
    if (!file.parent) {
        return { id: `/${file.id}/`, name: `/${file.name}/` };
    }
    // If the file has a path, return it
    if (file.path) {
      return file.path;
    }
    // Retrieve the file's parent folder
    const parent = map.get(file.parent);
    // Create a path using the path of the file's parent
    let path = GD_getPath(parent, map);
    // If the file's parent is not a root folder, add its parent's fileId/name to the path
    if (parent.mimeType === 'application/vnd.google-apps.folder' && !parent.root) {
        path = { id: path.id + `${parent.id}/`, name: path.name + `${parent.name}/` };
    }
    // If the file's map entry does not a path property set, add the file's path 
    if (!map.get(file.id).path) {
        map.set(file.id, { ...map.get(file.id), path: path });
    }
    // Return the path of the file
    return path;
}

/**
 * Converts an array of permissions into an object
 * @param {Object[]} permissionList - An list of Google Drive permission objects
 * @returns {Object} permissions - Objects containing all of the file's permissions as strings and objects
 */
function GD_createPermissionObject(permissionList) {
    // Object to store the permissions of a file
    const permissions = {};
    const permissionsRaw = {};
    // Insert the permissions into permission object as '(type, emailAddress/domain, role)' values
    for (const permission of permissionList) {
        switch (permission.type) {
            // Files shared to individual users or groups have email addresses
            case 'user':
            case 'group':
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
}

/**
 * Returns a map of all the files in the user's drives
 * @param {Object} driveAPI - Instance of the Google Drive API service
 * @param {Object} driveIds - The Ids and names of all of the user's drives
 * @returns {Object[]} map - Map of all the files in the user's drives
 */
async function GD_getFileMap(driveAPI, driveIds) {
    try {
        // Retrieve the file data of all files in the user's drives
        const driveFiles = await GD_getFiles(driveAPI);
        // List of all files in the user's drive
        let files = [];
        // Create file objects for each of the user's drives' root folders
        for (const drive of Object.keys(driveIds)) {
            files.push({ id: drive, name: driveIds[drive], mimeType: 'application/vnd.google-apps.folder', root: true, children: [] });
        }
        // Append file data retrieved from the Google Drive API to the list of files
        files = [...files, ...driveFiles];
        // Map storing fileId and file key-value pairs
        const map = new Map();
        // Insert the files into the map
        for (const file of files) {
            // Object containing file field overrides
            let overrides = {};
            // If the file has a parent folder, list it as a child of the parent folder
            if (file.parents) {
                // Replace the file's parents array with a string
                overrides['parent'] = file.parents[0];
                // If the parent already has an entry in the map, append the file to the parent entry's children array
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
                overrides['owner'] = file.owners[0].emailAddress;
                // Set the file's creator to its owner (Google Drive does not have a creator field)
                overrides['creator'] = file.owners[0].emailAddress;
            }
            // Replace the file's sharing user array with only the sharing user's email address
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
                        overrides['parent'] = 'SharedWithMe';
                        // Add file as a child of the 'Shared With Me' file collection
                        let parent = map.get('SharedWithMe');
                        map.set(parent.id, { ...parent, children: [...parent.children, file.id] });
                    }
                }
            }
            // Replace the file's permission array with an object
            if (file.permissions) {
                const permissionObjects = GD_createPermissionObject(file.permissions);

                let readable = [];
                let writable = [];
                let sharable = [];
                // For-loop to add each user to the appropriate access array
                for (const permission of file.permissions) {
                    switch (permission.role) {
                        case 'owner':
                            sharable.push(permission.emailAddress);
                        case 'writer':
                            writable.push(permission.emailAddress);
                        case 'reader':
                        case 'commenter':
                            readable.push(permission.emailAddress);
                        }
                }

                overrides['readable'] = readable;
                overrides['writable'] = writable;
                overrides['sharable'] = sharable;
                overrides['permissions'] = permissionObjects.permissions;
                overrides['permissionsRaw'] = permissionObjects.permissionsRaw;
            }
            // If the file already has an entry in the map (because it's the parent folder of some file in the map), update the entry with the file's other fields (parents, permissions, etc.)
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
        for (const file of files) {
            GD_getPath(map.get(file.id), map);
        }
        // Return the map of the user's files
        return map;
    } catch(error) {
        throw new Error(`Failed to retrieve file map. ${error}`); 
    }
}

module.exports = {
    GD_getDrives,
    GD_getFileMap,
    GD_initializeAPI
};