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
router.get("/my-surveys/create", survey_controller.survey_create_get);

// POST request for creating Survey.
router.post("/my-surveys/create", survey_controller.survey_create_post);

// GET request to display a list of the user's own surveys
router.get("/my-surveys", survey_controller.user_survey_list);

// GET request to display details of the user's saved survey
router.get("/my-surveys/saved/:id", survey_controller.survey_saved_detail);

// POST request to publish user's saved survey
router.post("/my-surveys/saved/:id", survey_controller.survey_publish_post);

// GET request to edit user's saved survey
router.get("/my-surveys/saved/:id/edit", survey_controller.survey_edit_get);

// POST request to edit user's saved survey
router.post("/my-surveys/saved/:id/edit", survey_controller.survey_edit_post);

// POST request to delete a saved survey
router.post("/my-surveys/saved/:id/delete", survey_controller.survey_delete);

// GET request to display details of the user's published survey
router.get("/my-surveys/published/:id", survey_controller.survey_published_detail)

router.get('/my-surveys/published/:id/export', survey_controller.survey_export_get);

module.exports = router;


