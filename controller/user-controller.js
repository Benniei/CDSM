const User = require('../models/user-model');

updateACR = async (req, res) => {
    try {
        // Check if user is authenticated with Google
        if (req.user && req.user.cloudProvider == 'google') {
            // Retrieve User refreshToken from database
            const user = await User.findById(req.user.id, { _id: 0, refreshToken: 1 });
            if (!user) {
                throw new Error('Could not find User in database.');
            }
            const acr = await User.findOneAndUpdate({ _id: user._id }, { $set:{ access_control_req: req.access_control_req }, { fields: 'access_control_req -_id', returnDocument: 'after' } });
            res.status(200).json({ success: true, acr: acr.access_control_req });
        } else {
            res.status(403).json({ success: false, error: 'Unauthorized.' });
            throw new Error('Unauthorized User.');
        }
    } catch(error) {
        console.error('Failed to update ACR: ' + error);
        res.status(400).json({ success: false, error: error });   
}

module.exports = {
    updateACR
};