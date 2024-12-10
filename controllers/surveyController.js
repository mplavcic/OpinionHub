const mongoose = require("mongoose");
const Survey = require("../models/survey");
const Question = require("../models/question/question");
const MultipleChoiceQuestion = require("../models/question/question_multiple_choice");
const RatingQuestion = require("../models/question/question_rating");
const TextQuestion = require("../models/question/question_text");
const Response = require("../models/response");
const asyncHandler = require("express-async-handler");
const moment = require("moment");

// Display list of all Surveys.
exports.survey_list = asyncHandler(async (req, res, next) => {
    const allSurveys = await Survey.find();

    res.render("survey_list", { title: "Survey list", survey_list: allSurveys });
});

// Display detail page for a specific Survey.
exports.survey_detail = asyncHandler(async (req, res, next) => {
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId).exec();
    const formattedExpiresAt = moment(survey.expires_at).format("MMMM Do YYYY");

    res.render("survey_detail", { 
        title: survey.title, 
        survey:survey,
        formattedExpiresAt: formattedExpiresAt
    });
});

// Display Survey create form on GET.
exports.survey_create_get = asyncHandler(async (req, res, next) => {
    res.render("survey_create");
});

// Handle Survey create on POST.
exports.survey_create_post = asyncHandler(async (req, res, next) => {
    const { title, description, expires_at, questions } = req.body;

    const newSurvey = new Survey({
        title,
        description,
        created_by: new mongoose.Types.ObjectId(req.user.id),
        expires_at: moment(expires_at).toDate()
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

            const savedQuestion = await questionModel.save();
            return savedQuestion; 
        })
    );

    savedSurvey.questions = questionDocs.map((qDoc) => qDoc._id);

    await savedSurvey.save();

    res.redirect("/home");
});

// Display Survey take form on GET
exports.survey_take_get = asyncHandler(async (req, res, next) => {
    const surveyId = req.params.id;
    const survey = await Survey.findById(surveyId).populate("questions").exec();
    res.render("survey_take", {
        title: `Take Survey: ${survey.title}`,
        survey,
    });
});

// Submit Survey take form on POST
exports.survey_take_post = asyncHandler(async (req, res, next) => {
    const { id: surveyId } = req.params; 
    const answers = req.body.answers;

    const responses = Object.entries(answers).map(([questionId, responseValue]) => ({
        survey: surveyId,
        question: questionId,
        responseValue,
    }));

    await Response.insertMany(responses);

    res.redirect("/home");
});

exports.user_survey_list = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const surveys = await Survey.find({ created_by: userId });

    res.render('user_surveys', { title: 'My Published Surveys', survey_list: surveys });
});

exports.user_survey_detail = asyncHandler(async (req, res, next) => {
    const surveyId = req.params.id;

    const survey = await Survey.findById(surveyId).populate("questions");

    const responses = await Response.find({ survey: surveyId });

    const analytics = {};
    survey.questions.forEach((question) => {
        const questionResponses = responses.filter(
            (response) => response.question.toString() === question._id.toString()
        );

        if (question.questionType === "multiple-choice") {
            const counts = {};
            question.options.forEach((option) => {
                counts[option] = questionResponses.filter(
                    (response) => response.responseValue === option
                ).length;
            });
            analytics[question._id] = { type: "multiple-choice", counts };
        } else if (question.questionType === "rating") {
            const total = questionResponses.reduce(
                (sum, response) => sum + parseInt(response.responseValue, 10),
                0
            );
            const avg = questionResponses.length
                ? total / questionResponses.length
                : 0;
            analytics[question._id] = { type: "rating", average: avg };
        } else if (question.questionType === "text") {
            const texts = questionResponses.map((response) => response.responseValue);
            analytics[question._id] = { type: "text", responses: texts };
        }
    });

    res.render("user_survey_detail", {
        title: `Analytics for ${survey.title}`,
        survey,
        analytics,
    });
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



