// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for Snapshot
const GroupSnapshotSchema = new Schema(
    {         // Unique ID of the screenshot
        user: { type: String, required: true },                   // User that created the screenshot
        emails: { type: [String], required: true},            // list of emails in the group 
        domain: { type: String, required: true}            // domain of the group
    },
    { timeStamps: true }                                        // Timestamps for when screenshot was created and last updated
);

module.exports = mongoose.model('GroupSnapshot', GroupSnapshotSchema);