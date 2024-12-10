const Survey = require("../models/survey");
const asyncHandler = require("express-async-handler");

// Render index page
exports.index = asyncHandler(async (req, res, next) => {
    const allSurveys = await Survey.find();
    res.render("index", { title: "OpinionHub", survey_list: allSurveys });
});

