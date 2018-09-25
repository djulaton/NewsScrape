var mongoose = require("mongoose");

// save a reference to the schema constructor
var Schema = mongoose.Schema;

// using the Schema constructor,
// similar to a Sequelize model
var ArticleSchema = new Schema({
    // 'title' is required and of type string
    title: {
        type: String,
        required: true
    },
    // 'link' is rquired and of type String
    link: {
        type: String,
        required: true
    },
    // 'note' is an object that stores a note id
    // the ref property links the object id to the note model
    // This allows us to populate the Article with an associated note
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

// this creates our model from the above schema using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// export the Article model
module.exports = Article