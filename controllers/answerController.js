const Answer = require("../models/answer");
const asyncHandler = require("express-async-handler");

// Display list of all Answers.
exports.answer_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer list");
});

// Display detail page for a specific Answer.
exports.answer_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Answer detail: ${req.params.id}`);
});

// Display Answer create form on GET.
exports.answer_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer create GET");
});

// Handle Answer create on POST.
exports.answer_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer create POST");
});

// Display Answer delete form on GET.
exports.answer_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer delete GET");
});

// Handle Answer delete on POST.
exports.answer_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer delete POST");
});

// Display Answer update form on GET.
exports.answer_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer update GET");
});

// Handle Answer update on POST.
exports.answer_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Answer update POST");
});

