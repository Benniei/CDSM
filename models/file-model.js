// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema(
    {
        snapshotId: { type: String, required: true},                                                    // The FileSnapshot associated with this file
        fileId: { type: String, required: true },                                                       // Unique file Id taken from cloud provider
        name: { type: String, required: true },                                                         // Name of file taken from cloud provider
        driveId: { type: String, required: false },                                                     // Type of drive: 'My Drive', 'Shared With Me', or Shared Drive ID taken from cloud provider
        path: { type: String, required: false },                                                        // Path from the drive's root folder
        owner: { type: String, required: false },                                                       // Owner of the file taken from cloud provider
        creator: { type: String, required: false },                                                     // Creator of the file taken from cloud provider
        sharingUser: { type: String, required: false },                                                 // User who shared the file, taken from cloud provider
        root: { type: Boolean, required: false },                                                       // Whether file is the drive's root folder
        parent: { type: String, required: false },                                                     // File Id of the file's parent folders
        children: { type: [String], required: false, default: () => { return null; } },                 // File Ids of the folder's children files
        permissions: { type: Object, required: false },                                                 // List of the file's permissions taken from cloud provider
        permissionIds: { type: [String], required: false, default: () => { return null; } },            // Ids of the file's permissions taken from cloud provider
        lastModifiedTime: { type: String, required: false },                                            // Timestamp of when the file was last modified
        deviantPermissions: { type: [[Object]], required: false, default: () => { return null; } },     // Permissions that deviate from those found in other files in the same folder
        fileFolderDifferences: { type: Object, required: false }                                        // Permissions that are different from those of the parent folder
    }
);

module.exports = mongoose.model('File', FileSchema);