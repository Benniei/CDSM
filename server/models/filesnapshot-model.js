// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const FileSnapshotSchema = new Schema(
    {
        snapshotId: { type: String, required: true },           // Unique ID of the screenshot
        user: { type: User, required: true },                   // User that created the screenshot
        searchHistory: { type: [String], required: true },      // history of search queries
        drive: { type: [String], required: true },              // drives (replace with [Drive]?)
        metadata: {type: [String], required: false }            // Any additional metadata
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('FileSnapshot', FileSnapshotSchema);