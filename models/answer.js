const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    survey: { type: Schema.Types.ObjectId, ref: "Survey", required: true }, // Reference to the survey
    question: { type: Schema.Types.ObjectId, ref: "Question", required: true }, // Reference to the question
    respondent: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user who answered
    answerText: { type: String }, // For text or short answer responses
    selectedOption: { type: String }, // For multiple-choice responses
    ratingValue: { type: Number }, // For rating responses
    answeredAt: { type: Date, default: Date.now } // Timestamp of the answer
});

module.exports = mongoose.model("Answer", AnswerSchema);

