const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Handle User signup (create) on POST.
exports.user_create_post = asyncHandler(async (req, res, next) => {
   
    const { name,  password } = req.body;
       
        // Check if the name already exists
        const userExists = await User.findOne({
            name
        }).exec();
        if (userExists) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        await User.create({
            name,
            password: await bcrypt.hash(password, 15),
        });

        return res.status(200).send("Signup successful");

});

// Handle User login on POST.
exports.user_login_post = asyncHandler(async (req, res, next) => {
    
    const { name, password } = req.body;
    
    // Check if the user exists
    const user = await User.findOne({
        name
    }).exec();
    if (!user) {
        return res.status(404).json({ message: "Username not found" });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
        return res.status(401).json({ message: "Incorrect password!" });
    }
    
    // Authenticate user with jwt
    const token = jwt.sign(
            { id: user.id }, 
            process.env.JWT_SECRET || "default_jwt_secret", // Use a default if the env variable isn't set
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION || "1h" } // Default to 1 hour expiration
        );
    
    // Set the token in an HTTP-only cookie
    res.cookie("OpinionHub_token", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent only over HTTPS in production
    });
    
    const redirectTo = req.cookies.redirectTo ? req.cookies.redirectTo : "/home";
    res.clearCookie("redirectTo"); // Clear the redirectTo cookie after reading it
    res.status(200).json({ redirectTo });
});

// logout user
exports.user_logout = asyncHandler(async (req, res, next) => {

    res.clearCookie("OpinionHub_token");

    res.redirect("/"); 
});

