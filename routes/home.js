const express = require("express");
const router = express.Router();

const survey_controller = require("../controllers/surveyController.js");
const user_controller = require("../controllers/userController.js");

/* GET home page */
router.get("/", function(req, res) {
    res.render("home");
});

// Logout route
router.get("/logout", user_controller.user_logout);

/// SURVEY ROUTES ///

// GET request for creating Survey. NOTE This must come before route for id (i.e. display Survey).
router.get("/survey/create", survey_controller.survey_create_get);

// POST request for creating Survey.
router.post("/survey/create", survey_controller.survey_create_post);

// GET request to delete Survey.
router.get("/survey/:id/delete", survey_controller.survey_delete_get);

// POST request to delete Survey.
router.post("/survey/:id/delete", survey_controller.survey_delete_post);

// GET request to update Survey.
router.get("/survey/:id/update", survey_controller.survey_update_get);

// POST request to update Survey.
router.post("/survey/:id/update", survey_controller.survey_update_post);

// GET request to display a list of the user's own surveys
router.get('/my-surveys', survey_controller.user_survey_list);

// GET request to display details of the user's own survey
router.get('/my-surveys/:id', survey_controller.user_survey_detail);


module.exports = router;


