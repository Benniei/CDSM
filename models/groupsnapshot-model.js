// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const GroupSnapshotSchema = new Schema(
    {         // Unique ID of the screenshot
        user: { type: String, required: true },                   // User that created the screenshot
        emails: { type: [String], required: true},            // list of groups mentioned (replace with [Group]?)
        name: { type: String, required: true},
        domain: { type: String, required: true}            // any additional metadata saved
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('GroupSnapshot', GroupSnapshotSchema);