// Dependencies
// =============================================================
const cool = require("cool-ascii-faces");
const express = require("express");
const path = require("path");
const fs = require("fs");

//Sets up Heroku App
//==============================================================
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Routes
// =============================================================

// Basic route that sends the user to the index page
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// Basic route that sends the user to the notes page
app.get("/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "public/notes.html"));
});

// Route that sends the user the db.json file
app.get("/api/notes", function(req, res) {
    res.sendFile(path.join(__dirname, "db.json"));
});

// Takes a JSON input with keys "title" and "text" and adds a new note object with that message to the db.json file
app.post("/api/notes", function(req, res) {
    fs.readFile(path.join(__dirname, "db.json"), "utf8", function(error, response) {
        if (error) {
            console.log(error);
        }
        const notes = JSON.parse(response);
        const noteRequest = req.body;
        const newNoteId = notes.length + 1;
        const newNote = {
            id: newNoteId,
            title: noteRequest.title,
            text: noteRequest.text
        };
        notes.push(newNote);
        res.json(newNote);
        fs.writeFile(path.join(__dirname, "db.json"), JSON.stringify(notes, null, 2), function(err) {
            if (err) throw err;
        });
    });
});

// Deletes the note object with requested id from the db.json file, returns the deleted note; if no such id exists returns false
app.delete("/api/notes/:id", function(req, res) {
    const deleteId = req.params.id;
    fs.readFile("db.json", "utf8", function(error, response) {
        if (error) {
            console.log(error);
        }
        let notes = JSON.parse(response);
        if (deleteId <= notes.length) {
            // Method to remove an element from an array obtained from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
            res.json(notes.splice(deleteId-1,1));
            // Reassign the ids of all notes
            for (let i=0; i<notes.length; i++) {
                notes[i].id = i+1;
            }
            fs.writeFile("db.json", JSON.stringify(notes, null, 2), function(err) {
                if (err) throw err;
            });
        } else {
            res.json(false);
        }
        

    });
    
});

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});