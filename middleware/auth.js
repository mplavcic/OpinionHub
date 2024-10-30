const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.OpinionHub_token;

    if (!token) {
        return res.status(401).json('Access denied. No token provided.');
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret', (err, user) => {
        if (err) {
            return res.status(403).json('Invalid or expired token.');
        }

        // Attach the user object to the request so it's available in the next handlers
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;

