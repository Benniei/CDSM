// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const FileSnapshotSchema = new Schema(
    {
        owner: { type: String, required: true },                // ID of the User who created the screenshot
        snapshotId: { type: String, required: true },           // Unique ID of the screenshot
        drive: { type: Schema.Types.Mixed, required: true },    // Object containing files in user's drive
        metadata: {type: [String], required: false }            // Any additional metadata
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('FileSnapshot', FileSnapshotSchema);