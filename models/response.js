const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
    publishedSurvey: { // Add PublishedSurvey reference
        type: Schema.Types.ObjectId,
        ref: "PublishedSurvey",
        required: true,
    },
    survey: {
        type: Schema.Types.ObjectId,
        ref: "Survey",
        required: true,
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: true,
    },
    responseValue: {
        type: Schema.Types.Mixed,
        required: true,
    },
});

module.exports = mongoose.model("Response", ResponseSchema);

