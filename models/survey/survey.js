const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SurveySchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    description: { type: String, maxLength: 1000 },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }], 
    //tags: [{ type: String }], // Tags or categories for the survey
}, { timestamps: true }); 

// Virtual for survey's URL
SurveySchema.virtual("url").get(function () {
    return `/survey/${this._id}`;
});

// Virtual for saved survey's URL
SurveySchema.virtual("saved_url").get(function () {
    return `/home/my-surveys/saved/${this._id}`;
});

module.exports = mongoose.model("Survey", SurveySchema);

