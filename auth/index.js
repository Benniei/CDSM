const jwt = require("jsonwebtoken")

function authManager() {
    verify = function (req, res, next) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({
                    status: "ERROR",
                    loggedIn: false,
                    user: null,
                    errorMessage: "Unauthorized"
                })
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET)
            req.userId = verified.userId;

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({
                status: "ERROR",
                errorMessage: "Unauthorized"
            });
        }
    }

    signToken = function (user) {
        return jwt.sign({
            userId: user
        }, process.env.JWT_SECRET);
    }

    return this;
}

const auth = authManager();
module.exports = auth;