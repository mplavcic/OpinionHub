const mongoose = require("mongoose");
const Survey = require("../models/survey");
const Question = require("../models/question");
const MultipleChoiceQuestion = require("../models/question_multiple_choice");
const RatingQuestion = require("../models/question_rating");
const TextQuestion = require("../models/question_text");
const asyncHandler = require("express-async-handler");

// Display list of all Surveys.
exports.survey_list = asyncHandler(async (req, res, next) => {
    const allSurveys = await Survey.find();

    res.render("survey_list", { title: "Survey list", survey_list: allSurveys });
});

// Display detail page for a specific Survey.
exports.survey_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Survey detail: ${req.params.id}`);
});

// Display Survey create form on GET.
exports.survey_create_get = asyncHandler(async (req, res, next) => {
  res.render("survey_create");
});

// Handle Survey create on POST.
exports.survey_create_post = asyncHandler(async (req, res, next) => {
  
    console.log(req.body);
    const { title, description, expires_at, questions } = req.body;

    const newSurvey = new Survey({
        title,
        description,
        created_by: new mongoose.Types.ObjectId(req.user._id),
        expires_at,
    });

    const savedSurvey = await newSurvey.save();

    const questionDocs = await Promise.all(
        questions.map(async (q) => {
            let questionModel;
            switch (q.questionType) {
                case "multiple-choice":
                    questionModel = new MultipleChoiceQuestion({
                        survey: savedSurvey._id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        options: q.options,
                    });
                    break;
                case "rating":
                    questionModel = new RatingQuestion({
                        survey: savedSurvey._id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        min: q.min,
                        max: q.max,
                    });
                    break;
                case "text":
                default:
                    questionModel = new TextQuestion({
                        survey: savedSurvey._id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        placeholder: q.placeholder || "",
                    });
                    break;
            }
            return questionModel.save();
        })
    );

    savedSurvey.questions = questionDocs.map((qDoc) => qDoc._id);
    await savedSurvey.save();

    res.redirect("/home");
});

// Display Survey delete form on GET.
exports.survey_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Survey delete GET");
});

// Handle Survey delete on POST.
exports.survey_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Survey delete POST");
});

// Display Survey update form on GET.
exports.survey_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Survey update GET");
});

// Handle Survey update on POST.
exports.survey_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Survey update POST");
});



