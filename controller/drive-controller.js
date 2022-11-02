// Being changed to a wrapper.
const GoogleDriveController = require('../controller/google-drive-controller');
const User = require('../models/user-model');

createFileSnapshot = async (req, res) => {
    try {
        const user = await User.findById(req.userId, {_id: 1, refreshToken: 1, filesnapshot: 1, cloudProvider: 1});
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        req.user = user;
        switch (req.user.cloudProvider) {
            case 'google':
                GoogleDriveController.createFileSnapshot(req, res);
                break;
            default:
                throw new Error('Could not find listed cloud provider');
        }
    } catch(error) {
        console.error('Failed to create File Snapshot: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

module.exports = {
    createFileSnapshot
};