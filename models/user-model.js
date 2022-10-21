// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSnapshot = require('./filesnapshot-model');
const GroupSnapshot = require('./groupsnapshot-model');

// Schema for User
const UserSchema = new Schema(
    {
        profileId: { type: String, required: true },                                            // Unique profile ID taken from cloud provider
        cloudProvider: { type: String, required: true },                                        // Drive service selected by the user
        displayName: { type: String, required: true },                                          // First and last name taken from cloud provider
        email: { type: String, required: true },                                                // Email taken from cloud provider
        threshold: { type: Number, required: true },                                            // Threshold value for deviant check
        refreshToken: { type: String, required: false },                                        // Refresh token provided by cloud provider
        access_control_req: { type: String, required: false},                                   // Access control requirements assigned by the user
        searchHistory: { type: [String], required: true },                                      // History of search queries made by the user
        filesnapshot: { type: Schema.Types.ObjectId, ref:'FileSnapshot', required: false },
        groupsnapshot: { type: Schema.Types.ObjectId, ref:'GroupSnapshot', required: false }
    },
    { timeStamps: true }                                                                        // Timestamps for when document was created and last updated
);

module.exports = mongoose.model('User', UserSchema);