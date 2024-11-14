const Question = require("../models/question");
const asyncHandler = require("express-async-handler");

// Display list of all Questions.
exports.question_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question list");
});

// Display detail page for a specific Question.
exports.question_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Question detail: ${req.params.id}`);
});

// Display Question create form on GET.
exports.question_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question create GET");
});

// Handle Question create on POST.
exports.question_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question create POST");
});

// Display Question delete form on GET.
exports.question_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question delete GET");
});

// Handle Question delete on POST.
exports.question_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question delete POST");
});

// Display Question update form on GET.
exports.question_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question update GET");
});

// Handle Question update on POST.
exports.question_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Question update POST");
});

