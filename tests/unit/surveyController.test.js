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
const Response = require("../../models/response");

const app = express();
app.use(bodyParser.json());
app.post("/home/survey/create", authenticateToken, surveyController.survey_create_post);
app.post("/home/survey/:id/take", authenticateToken, surveyController.survey_take_post);

describe("Survey Create POST", () => {
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
    });
    
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
            .post("/home/survey/create")
            .set("Content-Type", "application/json")
            .set("Cookie", [`OpinionHub_token=${mockToken}`])
            .send(reqBody);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("/home");

        const savedSurvey = await Survey.findOne({ title: "Customer Satisfaction Survey" }).populate('questions');
        expect(savedSurvey).toBeDefined();
        expect(savedSurvey.created_by.toString()).toBe(mockUserId.toString());
    });

});

describe("Survey Take POST", () => {
    let mongoServer;
    let survey;
    let question1;
    let question2;
    let question3;

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
        await Question.deleteMany({});
        await Response.deleteMany({});
    });

    it("should save responses when survey is submitted", async () => {
        const mockToken = jwt.sign({ _id: mockUserId }, process.env.JWT_SECRET || "default_jwt_secret");

        survey = new Survey({
            title: "Customer Feedback Survey",
            description: "Survey to gather feedback",
            created_by: mockUserId,
            expires_at: new Date(Date.now() + 10000000), // 
        });

        question1 = new Question({
            survey: survey._id,
            questionText: "What is your favorite color?",
            questionType: "multiple-choice",
        });
        question1.options = ["Red", "Blue", "Green"];
        await question1.save();

        question2 = new Question({
            survey: survey._id,
            questionText: "Rate your experience from 1 to 5.",
            questionType: "rating",
        });
        await question2.save();

        question3 = new Question({
            survey: survey._id,
            questionText: "Any additional comments?",
            questionType: "text",
        });
        await question3.save();

        survey.questions.push(question1, question2, question3);
        await survey.save();

        const reqBody = {
            answers: {
                [question1._id]: "Red",          // multiple-choice answer
                [question2._id]: 5,              // rating answer
                [question3._id]: "Great service", // text answer
            },
        };

        const response = await request(app)
            .post(`/home/survey/${survey._id}/take`)
            .set("Content-Type", "application/json")
            .set("Cookie", [`OpinionHub_token=${mockToken}`])
            .send(reqBody);

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe("/home");

        const savedResponses = await Response.find({ survey: survey._id }).populate("question");
        expect(savedResponses).toHaveLength(3);

        const response1 = savedResponses.find((r) => r.question._id.toString() === question1._id.toString());
        expect(response1.responseValue).toBe("Red");

        const response2 = savedResponses.find((r) => r.question._id.toString() === question2._id.toString());
        expect(response2.responseValue).toBe(5);

        const response3 = savedResponses.find((r) => r.question._id.toString() === question3._id.toString());
        expect(response3.responseValue).toBe("Great service");
    });
});

