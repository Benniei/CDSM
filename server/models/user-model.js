// Import modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for User
const UserSchema = new Schema(
    {
        profileId: { type: String, required: true },            // Unique profile ID taken from cloud provider
        cloudProvider: { type: String, required: true },        // Drive service selected by the user
        displayName: { type: String, required: true },          // First and last name taken from cloud provider
        email: { type: String, required: true },                // Email taken from cloud provider
        threshold: { type: Number, required: true }             // Threshold value for deviant check
    },
    { timeStamps: true }                                        // Timestamps for when document was created and last updated
);

module.exports = mongoose.model('User', UserSchema);