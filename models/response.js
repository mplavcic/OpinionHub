const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
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
    /*
    timestamp: {
        type: Date,
        default: Date.now, 
    },
    metadata: {
        ipAddress: { type: String }, 
        userAgent: { type: String }, 
        location: { type: String },
    },
    */

});

module.exports = mongoose.model("Response", ResponseSchema);

