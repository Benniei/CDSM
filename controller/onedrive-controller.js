// Local imports
const Analyze = require('./analyze-controller');
const File = require('../models/file-model');
const FileSnapshot = require('../models/filesnapshot-model');
const User = require('../models/user-model');

// Import modules
const onedrive = require("onedrive-api");
const moment = require('moment');
const axios = require('axios');

/**
 * Return the accessToken of a user given their refreshToken
 * @param {string} refreshToken - Refresh token used to authorize Microsoft
 * @return {string} accessToken - Access token used to access OD files
 */
 async function OD_accessToken(refreshToken) {
    // Retrieve access token from Microsoft using refresh token
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
        console.log(response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.log(`Error in OD_getaccessToken:\n ${error}`);
        return "";
    }
}

/**
 * Retrieves a list of all of the user's drives
 * @param {string} accessToken - Access token used to access OD files
 * @returns {Object} driveIds - Name and Ids of all of the user's drives
 */
OD_getDrives = async function(accessToken) {
    // Object to store fileIds of all drives' root folder
    let driveIds = {};
    let drives = [{ id: 'SharedWithMe',  name: 'SharedWithMe' }];
    // Retrieve root folder of user's 'My Drive' collection
    // Retrieve access token from Microsoft using refresh token
    const options = {
        headers: {
            'Accept-Encoding': 'deflate, br',
            authorization: `Bearer ${accessToken}`
        }
    };
    const endpoint = "https://graph.microsoft.com/v1.0/me/drives";

    try {
        const response = await axios.get(endpoint, options);
        drives = [...drives, ...response.data.value]
        for (const drive of drives) {
            driveIds[drive.id] = drive.name;
        }
    } catch (error) {
        console.log(`Error in OD_getDrives:\n ${error}`);
        
    } finally {
        return driveIds;
    }
}

/**
 * Retrieves all files from the user's drives
 * @param {string} accessToken - Access token used to access OD files
 * @returns {Object[]} files - Array containing the file data of all files in the user's drives
 */
OD_getFiles = async function(accessToken) {
    // Array storing file data retrieved from the Google Drive API
    let files = [];
    // Next page token to loop file request
    let pageToken = '';

    const options = {
        headers: {
            'Accept-Encoding': 'deflate, br',
            authorization: `Bearer ${accessToken}`
        }
    };
    const endpoint = "https://graph.microsoft.com/v1.0/me/drive/search(q='')";
    try {
        // Do-while-loop to retrieve all files in user's drive
        do {
            // Request file data for up to a maximum of 1000 files
            let response;
            if (pageToken === '') {
                response = await axios.get(endpoint, options);
            } else {
                response = await axios.get(pageToken, options);
            }
            // If file data was retrieved, append it to the list of retrieved files
            if (response.data.value.length > 0) {
                files = [...files, ...response.data.value];
            }
            // Update next page token
            pageToken = response.data["@odata.nextLink"];
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

                const endpoint = `https://graph.microsoft.com/v1.0/me/drive/items/${file.id}/permissions`;
                try {
                    // Do-while-loop to retrieve sharing permission data of the file
                    do {
                        // Request file data for up to a maximum of 1000 files
                        let response;
                        if (pageToken === '') {
                            response = await axios.get(endpoint, options);
                        } else {
                            response = await axios.get(pageToken, options);
                        }

                        // If permission data was retrieved, append them to the array of retrieved permissions
                        if (response.data.value.length > 0) {
                            file.permissions = [...file.permissions, ...response.data.value];
                        }
                        // Update next page token
                        pageToken = response.data.nextPageToken;
                    } while (pageToken);
                    console.log(`Retrieved permission data of ${file.permissions.length} permissions for file '${file.id}'.`);
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
    return files;
}

/**
 * Converts an array of permissions into an object
 * @param {Object[]} permissionList - An list of Google Drive permission objects
 * @returns {Object} permissions - Objects containing all of the file's permissions as strings and objects
 */
OD_createPermissionObject = function(permissionList) {
    console.log(permissionList);
    // Object to store the permissions of a file
    const permissions = {};
    const permissionsRaw = {};
    // Insert the permissions into permission object as '(type, emailAddress/domain, role)' values
    for (const permission of permissionList) {
        if (permission.grantedTo) {
            let type = permission.grantedTo.user ? 'user' : 'group';
            let id = type === 'user' ? permission.grantedTo.user.id : permission.grantedTo.group.id;
            permissions[permission.id] = `(${type}, ${id}, ${permission.roles})`;
        } else if (permission.link) {
            permissions[permission.id] = `(domain, ${permission.link.webUrl}, ${permission.roles})`;
        } else {
            permissions[permission.id] = `(anyone, ${permission.roles})`;
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
OD_getPath = function(file, map) {
    // Have root folders return their fileId/name
    if (!file.parentReference) {
        return { id: `/${file.id}/`, name: `/${file.name}/` };
    }
    // If a file has a path, return it
    if (file.path) {
      return file.path;
    }
    // Parent of file
    const parent = map.get(file.parentReference.id);
    // Otherwise, create a path using the file's parent folder's path
    let path = OD_getPath(parent, map);
    // If the file's parent is not a root folder, add its parent's fileId/name to the path
    if (parent.folder && !parent.root) {
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
 * Creates a map-like object of all files in the user's drives
 * @param {string} accessToken - Access token used to access OD files
 * @param {Object} driveIds - Name and Ids of all of the user's drives
 * @returns {Map} map - Map of all files in the user's drives
 */
 OD_getFileMap = async function(accessToken, driveIds, profileId) {
    try {
        const options = {
            headers: {
                'Accept-Encoding': 'deflate, br',
                authorization: `Bearer ${accessToken}`
            }
        };
        // Retrieve the file data of all files in the user's drives
        const driveFiles = await OD_getFiles(accessToken);
        // List of all files in the user's drive
        let files = [];
        // Create file objects for each of the user's drives' root folders
        for (const drive of Object.keys(driveIds)) {
            files.push({ id: drive, name: driveIds[drive], root: true, children: [] });
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
            if (file.parentReference) {
                // Replace the file's parents array with a string
                overrides['parent'] = file.parentReference.id;
                // If the parent already has an entry in the map, append the file to the parent entry's children array
                if (map.get(file.parentReference.id)) {
                    let parent = map.get(file.parentReference.id);
                    let driveId = file.parentReference.driveId;
                    let endpoint = `https://graph.microsoft.com/v1.0/me/drives/${driveId}/items/${file.id}/children`;
                    let response = await axios.get(endpoint, options);
                    parent.children = response.data.value.map((child) => child.id);
                    map.set(parent.id, { ...parent, children: [...parent.children, file.id] });
                }
                // Otherwise, create an entry for the parent folder and add the file to its children array
                else {
                    let path = file.parentReference.path;
                    let name = path ? path.slice(path.lastIndexOf("/") + 1) : driveIds[file.parentReference.driveId];
                    let data = { id: file.parentReference.id, name: name, children: [file.id] };
                    map.set(file.parentReference.id, data);
                }
            }
            // Replace the file's owner object with only the owner's email address
            if (file.owner || file.createdBy) {
                overrides['owner'] = file.owner ? file.owner.user.email : file.createdBy.user.email;
                // Set the file's creator to its owner (Google Drive does not have a creator field)
                overrides['creator'] = file.owner ? file.owner.user.email : file.createdBy.user.email;
            }
            // Replace the file's sharing user array with only the sharing user's email address
            if (file.sharingUser) {
                overrides['sharingUser'] = file.sharingUser.user.email;
            }
            // Update the file's 'driveId' field if the file is part of the user's 'My Drive' or 'Shared with me' file collections
            if (!file.driveId && !file.root) {
                // File is part of the 'My Drive' file collection
                if (file.owner && file.createdBy.user.id == profileId) {
                    // Find driveId for 'My Drive' file collection
                    overrides['driveId'] = Object.keys(driveIds).find(key => driveIds[key] === 'OneDrive');
                } else if (file.createdBy && file.createdBy.user.id == profileId) {
                    // Find driveId for 'My Drive' file collection
                    overrides['driveId'] = Object.keys(driveIds).find(key => driveIds[key] === 'OneDrive');
                }
                // File is part of the 'Shared With Me' file collection
                else {
                    overrides['driveId'] = 'SharedWithMe';
                    // Set Parent to 'SharedWithMe' root folder if one doesn't exist
                    if (!file.parentReference) {
                        overrides['parent'] = 'SharedWithMe';
                        // Add file as a child of the 'Shared With Me' file collection
                        let parent = map.get('SharedWithMe');
                        map.set(parent.id, { ...parent, children: [...parent.children, file.id] });
                    }
                }
            }
            // Replace the file's permission array with an object
            if (file.permissions) {
                const permissionObjects = OD_createPermissionObject(file.permissions);

                let readable = [];
                let writable = [];
                let sharable = [];
                Object.values(permissionObjects.permissionsRaw).forEach(function (item) {
                    //console.log(item);
                    switch(item.role) {
                        case 'owner':
                            sharable.push(item.emailAddress);
                        case 'writer':
                            writable.push(item.emailAddress);
                        case 'reader':
                        case 'commenter':
                            readable.push(item.emailAddress);
                    }
                })
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
                if (file.folder) {
                    overrides['children'] = [];
                }
                map.set(file.id, { ...file, ...overrides });
            }
        }
        // Update each entry in the map with the file's path
        for (const file of files) {
            OD_getPath(map.get(file.id), map);
        }
        // Return the map of the user's files
        //console.log(map);
        return map;

    } catch(error) {
        throw new Error(`Failed to retrieve file map. ${error}`); 
    }
};

module.exports = {
    OD_getDrives,
    OD_getFileMap,
    OD_accessToken
};