// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const FileSnapshotSchema = new Schema(
    {
        owner: { type: String, required: true },                // ID of the user who created the screenshot
        snapshotId: { type: String, required: true },           // Unique Id of the screenshot
        myDrive: { type: Object, required: false },           // Map of all files in the user's primary drive
        sharedWithMe: { type: [String], required: false },      // Array containing files shared with the user
        sharedDrives: { type: [[String]], required: false},    // Array containing files in the user's shared drives
        metadata: {type: [String], required: false }            // Any additional metadata
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('FileSnapshot', FileSnapshotSchema);