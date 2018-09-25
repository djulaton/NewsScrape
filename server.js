// dependencies
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

// initialize Express
const app = express();

// express handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// port setup for Heroku deployment
var PORT = process.env.MONGU_URI || 3000;

// Database configuration with mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// scraping tools
// Axios - promised http library, similar to jquery's ajax method
const axios = require("axios");
const cheerio = require("cheerio");

// require all models
var db = require("./models");


// configure middleware
app.use(logger("dev"));
// use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// connect to the Mongo DB
// mongoose.connect("mongodb://localhost/week", { useNewUrlParser: true });

// Routes

// GET route for scraping Cosmopolitan website
app.get("scrape", function (req, res) {
    axios.get("https://www.cosmopolitan.com/health-fitness/").then(function (response) {
        // then we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag and do the following:
        $("div.full-item").each(function (i, element) {
            // save an empty result object
            var result = {};

            // add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // view the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // if an error occurred, send it to the client
                    return res.json(err);
                });
        });
        // if we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete")
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticle) {
            // if we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // if an error occurred, send it to the client
            res.json(err);
        });
});

// route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // using the id passed in the id parameter, prepare a query that finds a matching one in our db..
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // if we were able to successfully find an article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // if an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // create a new note and pass the req.body to the entry
    db.Note.create(req.body)
        .then(function (dbNote) {
            // if a Note was created successfully, find one Article with an `_id` equal to `rea.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // if we were able to succesfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // if an error occurred, send it to the client
            res.json(err);
        });
});

// start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});