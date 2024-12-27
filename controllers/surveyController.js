const mongoose = require("mongoose");
const Survey = require("../models/survey/survey");
const PublishedSurvey = require("../models/survey/survey_published");
const Question = require("../models/question/question");
const MultipleChoiceQuestion = require("../models/question/question_multiple_choice");
const RatingQuestion = require("../models/question/question_rating");
const TextQuestion = require("../models/question/question_text");
const Response = require("../models/response");
const asyncHandler = require("express-async-handler");
const moment = require("moment");

// Display list of all PublishedSurveys.
exports.survey_list = asyncHandler(async (req, res, next) => {
    
    const publishedSurveys = await PublishedSurvey.find();
    console.log("Published Surveys:", publishedSurveys); // Check if data is fetched

    res.render("survey_list", { title: "Survey list", survey_list: publishedSurveys });
});

// Display detail page for a specific PublishedSurvey.
exports.survey_detail = asyncHandler(async (req, res, next) => {
    const surveyId = req.params.id;
    const publishedSurvey = await PublishedSurvey.findById(surveyId).populate("survey").exec();
    const formattedExpiresAt = moment(publishedSurvey.expires_at).format("MMMM Do YYYY");

    res.render("survey_detail", {
        title: publishedSurvey.survey.title,
        survey: publishedSurvey,
        formattedExpiresAt: formattedExpiresAt,
    });
});

// Display Survey create form on GET.
exports.survey_create_get = asyncHandler(async (req, res, next) => {
    res.render("survey_create");
});

// Handle Survey create on POST.
exports.survey_create_post = asyncHandler(async (req, res, next) => {
    const { title, description, questions } = req.body;

    const newSurvey = new Survey({
        title,
        description,
        created_by: new mongoose.Types.ObjectId(req.user.id),
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

exports.survey_publish_post = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { expires_at } = req.body; 

    const survey = await Survey.findById(id);

    const publishedSurvey = new PublishedSurvey({
        survey: survey._id, 
        published_at: Date.now(),
        expires_at: new Date(expires_at), 
    });

    await publishedSurvey.save();

    res.redirect("/home/my-surveys");
});

// Display Survey take form on GET
exports.survey_take_get = asyncHandler(async (req, res, next) => {
    const { id: publishedSurveyId } = req.params;  

    const publishedSurvey = await PublishedSurvey.findById(publishedSurveyId)
        .populate({
            path: 'survey',  
            populate: { path: 'questions' }  
        })
        .exec();

    res.render("survey_take", {
        title: `Take Survey: ${publishedSurvey.survey.title}`,  
        survey: publishedSurvey,  
    });
});

// Submit Survey take form on POST
exports.survey_take_post = asyncHandler(async (req, res, next) => {
    const { id: publishedSurveyId } = req.params;  
    const answers = req.body.answers;

    const publishedSurvey = await PublishedSurvey.findById(publishedSurveyId)
        .populate("survey")  
        .exec();

    const survey = publishedSurvey.survey; 

    const responses = Object.entries(answers).map(([questionId, responseValue]) => ({
        publishedSurvey: publishedSurveyId,  
        survey: survey._id,   
        question: questionId,  
        responseValue,  
    }));

    await Response.insertMany(responses);
   
    await PublishedSurvey.findByIdAndUpdate(
            publishedSurveyId,
            { $inc: { take_count: 1 } }, 
    );

    res.redirect("/");
});

exports.user_survey_list = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const saved_surveys = await Survey.find({ created_by: userId });
    const published_surveys = await PublishedSurvey.find()
        .populate({
            path: 'survey',
        match: { created_by: userId },
        select: 'title', 
    });
    
    const filteredPublishedSurveys = published_surveys.filter(survey => survey.survey !== null);

    res.render("user_surveys", {
        title: "My Surveys",
        published_surveys: filteredPublishedSurveys,
        draft_surveys: saved_surveys,
        moment: moment, 
    });
});

exports.survey_published_detail = asyncHandler(async (req, res, next) => {
    const surveyId = req.params.id;

    const publishedSurvey = await PublishedSurvey.findById(surveyId)
        .populate({
            path: "survey", 
            populate: {
                path: "questions", 
                model: "Question", 
                select: "questionText questionType options min max placeholder", 
            },
        });

    const survey = publishedSurvey.survey; 
    const responses = await Response.find({ publishedSurvey: surveyId });

    const results = [];

    for (const question of survey.questions) {
        const questionResponses = responses.filter(
            (response) => response.question.toString() === question._id.toString()
        );

        let result = {
            questionId: question._id,
            questionText: question.questionText,
        };

        if (question.questionType === "multiple-choice") {
            const counts = {};
            question.options.forEach((option) => {
                counts[option] = questionResponses.filter(
                    (response) => response.responseValue === option
                ).length;
            });
            result.type = "multiple-choice";
            result.counts = counts;
        } else if (question.questionType === "rating") {
            const total = questionResponses.reduce(
                (sum, response) => sum + parseInt(response.responseValue, 10),
                0
            );
            const avg = questionResponses.length ? total / questionResponses.length : 0;
            result.type = "rating";
            result.average = avg;
        } else if (question.questionType === "text") {
            const texts = questionResponses.map((response) => response.responseValue);
            result.type = "text";
            result.responses = texts;
        }

        results.push(result);
    }

    const formattedPublishedAt = moment(publishedSurvey.published_at).format("MMMM Do YYYY");
    const formattedExpiresAt = moment(publishedSurvey.expires_at).format("MMMM Do YYYY");

    res.render("survey_published_detail", {
        title: `Analytics for ${survey.title}`,
        survey,
        results,  
        formattedPublishedAt,
        formattedExpiresAt,
        takeCount: publishedSurvey.take_count, 

    });
});

exports.survey_saved_detail = asyncHandler(async (req, res, next) => {
  const surveyId = req.params.id;
  
  const survey = await Survey.findById(surveyId).populate('questions'); 

  res.render("survey_saved_detail", {
    title: "Survey Details",
    survey: survey,
    moment: moment,
  });
});

exports.survey_edit_get = asyncHandler(async (req, res, next) => {
    const survey = await Survey.findById(req.params.id).populate("questions").exec();

    res.render("survey_edit_form", { survey });
});

exports.survey_edit_post = asyncHandler(async (req, res, next) => {
    const { title, description, questions } = req.body;

    const survey = await Survey.findById(req.params.id).exec();
   
    survey.title = title;
    survey.description = description;

    await Promise.all(
        survey.questions.map(async (questionId) => {
            await Question.findByIdAndDelete(questionId);
        })
    );

    const questionDocs = await Promise.all(
        questions.map(async (q) => {
            let questionModel;
            switch (q.questionType) {
                case "multiple-choice":
                    questionModel = new MultipleChoiceQuestion({
                        survey: survey._id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        options: q.options,
                    });
                    break;
                case "rating":
                    questionModel = new RatingQuestion({
                        survey: survey._id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        min: q.min,
                        max: q.max,
                    });
                    break;
                case "text":
                default:
                    questionModel = new TextQuestion({
                        survey: survey._id,
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

    survey.questions = questionDocs.map((qDoc) => qDoc._id);

    await survey.save();

    res.redirect(`/home/my-surveys`);
});

exports.survey_delete = asyncHandler(async (req, res, next) => {
    const surveyId = req.params.id;

    await Survey.findByIdAndDelete(surveyId);

    await Question.deleteMany({ survey: surveyId });

    res.redirect('/home/my-surveys');
});


