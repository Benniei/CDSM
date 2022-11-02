// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const FileSnapshotSchema = new Schema(
    {
        owner: { type: String, required: true },                                        // ID of the user who created the screenshot
        snapshotId: { type: String, required: true },                                   // Unique Id of the screenshot
        driveIds: { type: Object, required: false },                                    // File Ids of each drive's root folder
        metadata: {type: [String], required: false, default: () => { return null; } }   // Any additional metadata
    },
);

module.exports = mongoose.model('FileSnapshot', FileSnapshotSchema);