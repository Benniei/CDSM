// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema(
    {
        snapshotId: { type: String, required: true},                                                    // The FileSnapshot associated with this file
        fileId: { type: String, required: true },                                                       // Unique file Id taken from cloud provider
        name: { type: String, required: true },                                                         // Name of file taken from cloud provider
        driveId: { type: String, required: false },                                                     // Type of drive: 'My Drive', 'Shared With Me', or Shared Drive ID taken from cloud provider
        path: { type: Object, required: false },                                                        // Path from the drive's root folder
        owner: { type: String, required: false },                                                       // Owner of the file taken from cloud provider
        creator: { type: String, required: false },                                                     // Creator of the file taken from cloud provider
        sharingUser: { type: String, required: false },                                                 // User who shared the file, taken from cloud provider
        root: { type: Boolean, required: false, default: false },                                       // Whether file is the drive's root folder
        parent: { type: String, required: false },                                                      // File Id of the file's parent folders
        children: { type: [String], required: false, default: () => { return null; } },                 // File Ids of the folder's children files
        permissionIds: { type: [String], required: false, default: () => { return null; } },            // Ids of the file's permissions taken from cloud provider
        permissions: { type: Object, required: false },                                                 // List of the file's permissions as strings taken from cloud provider
        permissionsRaw: { type: Object, required: false },                                              // List of the file's permissions as objects form taken from cloud provider
        lastModifiedTime: { type: String, required: false },                                            // Timestamp of when the file was last modified
        readable: {type: [String], required: false },                                                   // list of email addresses with readable permission
        writable: {type: [String], required: false },                                                   // list of email addresses with writable permission
        sharable: {type: [String], required: false },                                                   // list of email addresses with sharable permission
        sharing: {type: [String], required: false, default: () => { return null; } },                   // type of grantee of sharing (user, group, domain, anyone)
        from: {type: [String], required: false, default: () => { return null; } },
        to: {type: [String], required: false, default: () => { return null; } },
    }, { minimize: false }                                                                              // Allow empty objects to be valid field values
);

module.exports = mongoose.model('File', FileSchema);