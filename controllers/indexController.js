const PublishedSurvey = require("../models/survey/survey_published");
const asyncHandler = require("express-async-handler");

// Render index page
exports.index = asyncHandler(async (req, res, next) => {
const publishedSurveys = await PublishedSurvey.find().populate("survey");

    res.render("index", {
        title: "OpinionHub",
        survey_list: publishedSurveys,
    });
});

