const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PublishedSurveySchema = new Schema({
    survey: { type: Schema.Types.ObjectId, ref: "Survey", required: true },  // Reference to the Survey model
    published_at: { type: Date, required: true },
    expires_at: { type: Date, required: true ,index: { expires: 0 } },
    take_count: { type: Number, default: 0 },
}, { timestamps: true });

// Virtual for published survey's URL
PublishedSurveySchema.virtual("published_url").get(function () {
    return `/home/my-surveys/published/${this._id}`;
});

// Virtual for public view of published survey
PublishedSurveySchema.virtual("public_url").get(function () {
    return `/survey/${this._id}`;
});


module.exports = mongoose.model("PublishedSurvey", PublishedSurveySchema);

