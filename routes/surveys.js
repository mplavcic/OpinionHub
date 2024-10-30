var express = require('express');
var router = express.Router();
const survey_controller = require("../controllers/surveyController.js");

/* GET survey list page */
router.get("/", function(req, res) {
    res.render("surveys");
});

module.exports = router;


