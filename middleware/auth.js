const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {

    if (req.path === '/home/logout') {
        return next();
    }

    const token = req.cookies.OpinionHub_token;

    if (!token) {
        res.cookie("redirectTo", req.originalUrl, { httpOnly: true });
        return res.redirect("/login");
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret", (err, user) => {
        if (err) {
            res.cookie("redirectTo", req.originalUrl, { httpOnly: true });
            return res.redirect("/login"); 
        }

        // Attach the user object to the request so it's available in the next handlers
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;

