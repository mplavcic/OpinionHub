const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SurveySchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  });

module.exports = mongoose.model("Survey", SurveySchema);

