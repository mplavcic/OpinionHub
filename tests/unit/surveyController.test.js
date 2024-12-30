const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const bodyParser = require("body-parser");
const moment = require("moment");
const jwt = require("jsonwebtoken");

let mockUserId;

jest.mock("../../middleware/auth", () => {
    return (req, res, next) => {
        req.user = { id: mockUserId };
        next();
    };
});

const authenticateToken = require("../../middleware/auth");
const surveyController = require("../../controllers/surveyController");
const Survey = require("../../models/survey/survey");
const Question = require("../../models/question/question");
const MultipleChoiceQuestion = require("../../models/question/question_multiple_choice");
const RatingQuestion = require("../../models/question/question_rating");
const TextQuestion = require("../../models/question/question_text");
const PublishedSurvey = require("../../models/survey/survey_published"); 
const Response = require("../../models/response");

const app = express();
app.use(bodyParser.json());
app.post("/home/my-surveys/create", authenticateToken, surveyController.survey_create_post);
app.post("/survey/:id/take", surveyController.survey_take_post);
app.post("/home/my-surveys/:id/edit", authenticateToken, surveyController.survey_edit_post);
app.post("/home/my-surveys/:id/delete", authenticateToken, surveyController.survey_delete);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    mockUserId = new mongoose.Types.ObjectId();
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
});

afterEach(async () => {
    await Survey.deleteMany({});
    await MultipleChoiceQuestion.deleteMany({});
    await RatingQuestion.deleteMany({});
    await TextQuestion.deleteMany({});
    await PublishedSurvey.deleteMany({});
    await Response.deleteMany({});
});

describe("Survey Create POST", () => {
    it("should create a survey and associated questions", async () => {
        const mockToken = jwt.sign({ _id: mockUserId }, process.env.JWT_SECRET || "default_jwt_secret");

        const reqBody = {
            title: "Customer Satisfaction Survey",
            description: "A survey to gauge customer satisfaction.",
            expires_at: moment().add(7, "days").toISOString(),
            questions: [
                {
                    questionType: "multiple-choice",
                    questionText: "What is your favorite color?",
                    options: ["Red", "Blue", "Green"],
                },
                {
                    questionType: "rating",
                    questionText: "Rate your experience from 1 to 5.",
                    min: 1,
                    max: 5,
                },
                {
                    questionType: "text",
                    questionText: "Any additional comments?",
                    placeholder: "Write here...",
                },
            ],
        };

        const response = await request(app)
            .post("/home/my-surveys/create")
            .set("Content-Type", "application/json")
            .set("Cookie", [`OpinionHub_token=${mockToken}`])
            .send(reqBody);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("/home");

        const savedSurvey = await Survey.findOne({ title: "Customer Satisfaction Survey" }).populate("questions");
        expect(savedSurvey).toBeDefined();
        expect(savedSurvey.created_by.toString()).toBe(mockUserId.toString());
    });
});

it("should save responses when survey is submitted for a published survey", async () => {
    const mockToken = jwt.sign({ _id: mockUserId }, process.env.JWT_SECRET || "default_jwt_secret");

    const survey = new Survey({
        title: "Customer Feedback Survey",
        description: "Survey to gather feedback",
        created_by: mockUserId,
    });
    await survey.save();

    const question1 = new Question({
        survey: survey._id,
        questionText: "What is your favorite color?",
        questionType: "multiple-choice",
        options: ["Red", "Blue", "Green"],
    });
    await question1.save();

    const question2 = new Question({
        survey: survey._id,
        questionText: "Rate your experience from 1 to 5.",
        questionType: "rating",
    });
    await question2.save();

    const question3 = new Question({
        survey: survey._id,
        questionText: "Any additional comments?",
        questionType: "text",
    });
    await question3.save();

    survey.questions.push(question1, question2, question3);
    await survey.save();

    const publishedSurvey = new PublishedSurvey({
        survey: survey._id,
        published_at: new Date(),
        expires_at: new Date(Date.now() + 10000000), 
    });
    await publishedSurvey.save();

    const reqBody = {
        answers: {
            [question1._id]: "Red",         
            [question2._id]: 5,             
            [question3._id]: "Great service", 
        },
    };

    const response = await request(app)
        .post(`/survey/${publishedSurvey._id}/take`) 
        .set("Content-Type", "application/json")
        .set("Cookie", [`OpinionHub_token=${mockToken}`])
        .send(reqBody);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/");

    const savedResponses = await Response.find({ survey: survey._id }).populate("question");
    expect(savedResponses).toHaveLength(3);

    const response1 = savedResponses.find((r) => r.question._id.toString() === question1._id.toString());
    expect(response1.responseValue).toBe("Red");

    const response2 = savedResponses.find((r) => r.question._id.toString() === question2._id.toString());
    expect(response2.responseValue).toBe(5);

    const response3 = savedResponses.find((r) => r.question._id.toString() === question3._id.toString());
    expect(response3.responseValue).toBe("Great service");
});

describe("Survey Edit POST", () => {
    it("should edit a survey's details and update its questions", async () => {
        const mockToken = jwt.sign({ _id: mockUserId }, process.env.JWT_SECRET || "default_jwt_secret");

        const survey = new Survey({
            title: "Original Title",
            description: "Original Description",
            created_by: mockUserId,
        });
        await survey.save();

        const question1 = new MultipleChoiceQuestion({
            survey: survey._id,
            questionText: "Old Question 1?",
            questionType: "multiple-choice",
            options: ["Option 1", "Option 2"],
        });
        await question1.save();

        const question2 = new TextQuestion({
            survey: survey._id,
            questionText: "Old Question 2?",
            questionType: "text",
        });
        await question2.save();

        survey.questions = [question1._id, question2._id];
        await survey.save();

        const reqBody = {
            title: "Updated Title",
            description: "Updated Description",
            questions: [
                {
                    questionType: "multiple-choice",
                    questionText: "New Question 1?",
                    options: ["New Option 1", "New Option 2"],
                },
                {
                    questionType: "rating",
                    questionText: "New Question 2?",
                    min: 1,
                    max: 5,
                },
            ],
        };

        const response = await request(app)
            .post(`/home/my-surveys/${survey._id}/edit`)
            .set("Content-Type", "application/json")
            .set("Cookie", [`OpinionHub_token=${mockToken}`])
            .send(reqBody);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("/home/my-surveys");

        const updatedSurvey = await Survey.findById(survey._id).populate("questions");
        expect(updatedSurvey.title).toBe("Updated Title");
        expect(updatedSurvey.description).toBe("Updated Description");
        expect(updatedSurvey.questions).toHaveLength(2);

        const newQuestion1 = await Question.findById(updatedSurvey.questions[0]);
        expect(newQuestion1.questionText).toBe("New Question 1?");
        expect(newQuestion1.options).toEqual(["New Option 1", "New Option 2"]);

        const newQuestion2 = await Question.findById(updatedSurvey.questions[1]);
        expect(newQuestion2.questionText).toBe("New Question 2?");
        expect(newQuestion2.min).toBe(1);
        expect(newQuestion2.max).toBe(5);

        const oldQuestion1 = await Question.findById(question1._id);
        const oldQuestion2 = await Question.findById(question2._id);
        expect(oldQuestion1).toBeNull();
        expect(oldQuestion2).toBeNull();
    });
});

it("should delete a survey and its associated questions", async () => {
    const mockToken = jwt.sign({ _id: mockUserId }, process.env.JWT_SECRET || "default_jwt_secret");

    const survey = new Survey({
        title: "Survey to be deleted",
        description: "This survey will be deleted in the test.",
        created_by: mockUserId,
    });
    await survey.save();

    const question1 = new Question({
        survey: survey._id,
        questionText: "Question 1?",
        questionType: "text",
    });
    const question2 = new Question({
        survey: survey._id,
        questionText: "Question 2?",
        questionType: "multiple-choice",
        options: ["Option A", "Option B"],
    });
    await question1.save();
    await question2.save();

    survey.questions.push(question1._id, question2._id);
    await survey.save();

    const savedSurvey = await Survey.findById(survey._id);
    const savedQuestions = await Question.find({ survey: survey._id });
    expect(savedSurvey).toBeDefined();
    expect(savedQuestions).toHaveLength(2);

    const response = await request(app)
        .post(`/home/my-surveys/${survey._id}/delete`) 
        .set("Cookie", [`OpinionHub_token=${mockToken}`]);

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/home/my-surveys");

    const deletedSurvey = await Survey.findById(survey._id);
    const deletedQuestions = await Question.find({ survey: survey._id });
    expect(deletedSurvey).toBeNull();
    expect(deletedQuestions).toHaveLength(0);
});

