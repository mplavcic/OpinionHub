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
const generateQRCode = require("../utils/qrcodeGenerator");
const Sentiment = require("sentiment");
const sanitizeHtml = require("sanitize-html");
const fs = require('fs');
const { parse } = require('json2csv');

const sanitizePlainText = (input) => {
    return sanitizeHtml(input, {
        allowedTags: [],  // Don't allow any tags
        allowedAttributes: {}, // Don't allow any attributes
        disallowedTagsMode: 'escape', // Escape any remaining tags
    });
}

// Display list of all PublishedSurveys.
exports.survey_list = asyncHandler(async (req, res, next) => {
    
    const publishedSurveys = await PublishedSurvey.find();

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

exports.survey_create_post = asyncHandler(async (req, res, next) => {
    const { title, description, questions } = req.body;

    // Ensure that options is always an array
    const sanitizedQuestions = questions
        ? questions.map((q) => ({
              questionText: sanitizePlainText(q.questionText || ""),
              questionType: sanitizePlainText(q.questionType || ""),
              options: q.options
                  ? q.options.map((opt) => sanitizePlainText(opt || "")).filter((opt) => opt.trim() !== "")
                  : [], // Ensure options is always an array
          }))
        : [];

    // Validate title
    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.render("survey_create", {
            error: "Invalid survey title.",
            title: sanitizePlainText(title || ""),
            description: sanitizePlainText(description || ""),
            questions: sanitizedQuestions,
        });
    }

    // Validate description
    if (!description || typeof description !== "string" || description.trim().length === 0) {
        return res.render("survey_create", {
            error: "Invalid survey description.",
            title: sanitizePlainText(title || ""),
            description: sanitizePlainText(description || ""),
            questions: sanitizedQuestions,
        });
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.render("survey_create", {
            error: "At least one question is required.",
            title: sanitizePlainText(title || ""),
            description: sanitizePlainText(description || ""),
            questions: sanitizedQuestions,
        });
    }

    // Validate individual questions
    for (let i = 0; i < sanitizedQuestions.length; i++) {
        const question = sanitizedQuestions[i];
        
        // Validate question type
        const validQuestionTypes = ["text", "multiple-choice", "rating"];
        if (!validQuestionTypes.includes(question.questionType)) {
            return res.render("survey_create", {
                error: `Invalid question type in Question ${i + 1}.`,
                title: sanitizePlainText(title || ""),
                description: sanitizePlainText(description || ""),
                questions: sanitizedQuestions,
            });
        }

        if (!question.questionText || question.questionText.trim().length === 0) {
            return res.render("survey_create", {
                error: `Question ${i + 1} is missing text.`,
                title: sanitizePlainText(title || ""),
                description: sanitizePlainText(description || ""),
                questions: sanitizedQuestions,
            });
        }

        if (question.questionType === "multiple-choice" && (!question.options || question.options.length === 0)) {
            return res.render("survey_create", {
                error: `Question ${i + 1} requires at least one non-empty option. Please delete the question and create new one`,
                title: sanitizePlainText(title || ""),
                description: sanitizePlainText(description || ""),
                questions: sanitizedQuestions,
            });
        }
    }

    // Create the survey object and save to the database
    const newSurvey = new Survey({
        title: sanitizePlainText(title),
        description: sanitizePlainText(description),
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
                        questionText: sanitizePlainText(q.questionText),
                        questionType: sanitizePlainText(q.questionType),
                        options: q.options ? q.options.map((opt) => sanitizePlainText(opt)) : [],
                    });
                    break;
                case "rating":
                    questionModel = new RatingQuestion({
                        survey: savedSurvey._id,
                        questionText: sanitizePlainText(q.questionText),
                        questionType: sanitizePlainText(q.questionType),
                        min: q.min,
                        max: q.max,
                    });
                    break;
                case "text":
                default:
                    questionModel = new TextQuestion({
                        survey: savedSurvey._id,
                        questionText: sanitizePlainText(q.questionText),
                        questionType: sanitizePlainText(q.questionType),
                        placeholder: sanitizePlainText(q.placeholder || ""),
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
    
    // TODO: maybe better to init outside the function
    const sentiment = new Sentiment();

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
            
            let positiveCount = 0;
            let neutralCount = 0; 
            let negativeCount = 0;

            texts.forEach((text) => {
                const analysis = sentiment.analyze(text);
                if (analysis.score > 0) positiveCount++;
                else if (analysis.score < 0) negativeCount++;
                else neutralCount++;
            });

            result.type = "text";
            result.positiveCount = positiveCount;
            result.neutralCount = neutralCount;
            result.negativeCount = negativeCount;    
        }

        results.push(result);
    }

    const formattedPublishedAt = moment(publishedSurvey.published_at).format("MMMM Do YYYY");
    const formattedExpiresAt = moment(publishedSurvey.expires_at).format("MMMM Do YYYY");
    
    // TODO: currently this is generating localhost:... which obviously doesnt work...
    const surveyUrl = `${req.protocol}://${req.get("host")}/survey/${surveyId}`;
    const qrCode = await generateQRCode(surveyUrl);

    res.render("survey_published_detail", {
        title: `Analytics for ${survey.title}`,
        survey,
        results,  
        formattedPublishedAt,
        formattedExpiresAt,
        takeCount: publishedSurvey.take_count,
        qrCode,
        publishedSurveyId: surveyId,
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

//TODO: input validation
//TODO: optimize, first we are deleting all the questions and then creating new ones,
//      even those that are not edited, should only delete edited
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

exports.survey_export_get = asyncHandler(async (req, res, next) => {
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

    const sentiment = new Sentiment();
    const results = [];

    for (const question of survey.questions) {
        const questionResponses = responses.filter(
            (response) => response.question.toString() === question._id.toString()
        );

        let result = {
            questionId: question._id.toString(),
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

            let positiveCount = 0;
            let neutralCount = 0;
            let negativeCount = 0;

            texts.forEach((text) => {
                const analysis = sentiment.analyze(text);
                if (analysis.score > 0) positiveCount++;
                else if (analysis.score < 0) negativeCount++;
                else neutralCount++;
            });

            result.type = "text";
            result.positiveCount = positiveCount;
            result.neutralCount = neutralCount;
            result.negativeCount = negativeCount;
        }

        results.push(result);
    }

    // Convert results to CSV
    const fields = ['questionId', 'questionText', 'type', 'positiveCount', 'neutralCount', 'negativeCount'];
    const opts = { fields };

    try {
        const csv = parse(results, opts);

        // Send the CSV file as a download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=survey_${surveyId}_analytics.csv`);
        res.status(200).end(csv);
    } catch (err) {
        console.error('Error generating CSV:', err);
        next(err);
    }
});


