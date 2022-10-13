// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const SnapshotSchema = new Schema(
    {
        snapshotId: { type: String, required: true },           // Unique ID of the screenshot
        user: { type: User, required: true },                   // User that created the screenshot
        isFileSnapshot: { type: Boolean, required: true },      // Whether it is a file sharing or group membership snapshot
        metadata: {type: [String], required: true }             // The actual metadata saved
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('Snapshot', SnapshotSchema);