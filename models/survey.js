const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SurveySchema = new Schema({
    title: { type: String, required: true, maxLength: 100 },
    description: { type: String, maxLength: 1000 },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }], // References Question schema
    //is_published: { type: Boolean, default: false }, // Indicates if the survey is published
    created_at: { type: Date, default: Date.now }, // Date the survey was created
    //published_at: { type: Date }, // Date the survey was published
    //updated_at: { type: Date, default: Date.now }, // Last update timestamp
    expires_at: { type: Date, required: true }, // Expiration date for the survey
    //response_count: { type: Number, default: 0 }, // Count of responses
    //tags: [{ type: String }], // Tags or categories for the survey
    //is_anonymous: { type: Boolean, default: false } // Whether responses are anonymous
});

// Virtual for survey's URL
SurveySchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/home/survey/${this._id}`;
});

module.exports = mongoose.model("Survey", SurveySchema);

