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

// GET request for taking Survey.
router.get("/survey/:id/take", survey_controller.survey_take_get);

// POST request for taking Survey.
router.post("/survey/:id/take", survey_controller.survey_take_post);

// GET request to delete Survey.
router.get("/survey/:id/delete", survey_controller.survey_delete_get);

// POST request to delete Survey.
router.post("/survey/:id/delete", survey_controller.survey_delete_post);

// GET request to update Survey.
router.get("/survey/:id/update", survey_controller.survey_update_get);

// POST request to update Survey.
router.post("/survey/:id/update", survey_controller.survey_update_post);

// GET request for one Survey.
router.get("/survey/:id", survey_controller.survey_detail);

// GET request for list of all Surveys.
router.get("/surveys", survey_controller.survey_list);

module.exports = router;


