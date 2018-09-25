// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // for each one
    for (var i = 0; i < data.length; i++) {
        // display the apropos info on the page
        $("articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
});

// whenever someone clicks a p tag
$(document).on("click", "p", function () {
    // empty the notes from the note section
    $("#notes").empty();
    // save the id from the p tag
    var thisId = $(this).attr("data-id");

    // now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // with that done, add the note information to the page
        .then(function (data) {
            console.log(data)
            // the title of the article
            $("#notes").append("<h2>" + data.title + "</h2>");
            //  an input to enter a new title
            $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
            // a button to submit a new note, with the id of the article saved to it
            $("notes").append("<button data-id'" + data._id + "'id='savenote'>Save Note</button>");

            // if there's a note in the article
            if (data.note) {
                // place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("bodyinput").val(data.note.body);
            }
        });
});

// when you click the savenote button
$(document).on("click", "#savenote", function () {
    // grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // value taken from the title input
            title: $("#titleinput").val(),
            // value taken from the note textarea
            body: $("bodyinput").val()
        }
    })
        // with that done
        .then(function (data) {
            // log the response
            console.log(data);
            // empty the notes section
            $("#notes").empty();
        });

    // also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
});