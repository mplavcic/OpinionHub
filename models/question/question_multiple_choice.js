const mongoose = require("mongoose");
const question = require("./question");

const Schema = mongoose.Schema;

const MultipleChoiceSchema = new Schema({
    options: {
        type: [String],
        required: function() { return this.questionType === "multiple-choice"; },
        validate: {
            validator: function(v) {
                return this.questionType !== "multiple-choice" || (Array.isArray(v) && v.length > 0 && v.every(opt => opt.trim().length > 0));

            },
            message: "At least one non-empty option is required for multiple-choice questions."
        }
    }
});

const MultipleChoiceQuestion = question.discriminator("MultipleChoiceQuestion", MultipleChoiceSchema);
module.exports = MultipleChoiceQuestion;

