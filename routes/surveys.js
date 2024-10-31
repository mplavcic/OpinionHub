const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController.js");
const userController = require("../controllers/userController.js");

/* GET survey list page */
router.get("/", function(req, res) {
    res.render("surveys");
});

// Logout route
router.get("/logout", userController.user_logout);

module.exports = router;


