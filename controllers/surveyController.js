const User = require("../models/survey");
const asyncHandler = require("express-async-handler");

// Display list of all Surveys.
//exports.survey_list = asyncHandler(async (req, res, next) => {
  //res.send("NOT IMPLEMENTED: Survey list");
//});

// Display Survey create form on GET.
exports.survey_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Survey create GET");
});

// Handle Survey create on POST.
exports.survey_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Survey create POST");
});



