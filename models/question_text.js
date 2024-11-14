const mongoose = require("mongoose");
const question = require("./question");

const Schema = mongoose.Schema;

const TextSchema = new Schema({
    placeholder: { type: String }
});

const TextQuestion = question.discriminator("TextQuestion", TextSchema);
module.exports = TextQuestion;

