const mongoose = require("mongoose");
const question = require("./question");

const Schema = mongoose.Schema;

const RatingSchema = new Schema({
    min: {
        type: Number,
        required: function() { return this.questionType === "rating"; },
        default: 1,
    },
    max: {
        type: Number,
        required: function() { return this.questionType === "rating"; },
        default: 5,
    }
});

const RatingQuestion = question.discriminator("RatingQuestion", RatingSchema);
module.exports = RatingQuestion;

