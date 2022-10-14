// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const GroupSnapshotSchema = new Schema(
    {
        snapshotId: { type: String, required: true },           // Unique ID of the screenshot
        user: { type: User, required: true },                   // User that created the screenshot
        groups: { type: [String], required: true },             // list of groups mentioned (replace with [Group]?)
        metadata: {type: [String], required: false }            // any additional metadata saved
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('GroupSnapshot', GroupSnapshotSchema);