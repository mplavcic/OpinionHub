const express = require("express");
const router = express.Router();

const survey_controller = require("../controllers/surveyController.js");
const index_controller = require("../controllers/indexController.js");

/* GET home page. */
router.get('/', index_controller.index);

// GET request for one Survey.
router.get("/survey/:id", survey_controller.survey_detail);

// GET request for taking Survey.
router.get("/survey/:id/take", survey_controller.survey_take_get);

// POST request for taking Survey.
router.post("/survey/:id/take", survey_controller.survey_take_post);

// GET request for list of all Surveys.
router.get("/surveys", survey_controller.survey_list);

module.exports = router;
