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
const Survey = require("../../models/survey");
const MultipleChoiceQuestion = require("../../models/question/question_multiple_choice");
const RatingQuestion = require("../../models/question/question_rating");
const TextQuestion = require("../../models/question/question_text");

const app = express();
app.use(bodyParser.json());
app.post("/home/survey/create", authenticateToken, surveyController.survey_create_post);

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

