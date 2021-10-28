const express = require('express');
const mongoose = require('mongoose');
const Note = require('./models/note');
const User = require('./models/user');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

//Set up mongoose connection
var mongoDB = 'mongodb://localhost:27017/CSE_316_Assignment_DB'; // insert your database URL here
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Changing this setting to avoid a Mongoose deprecation warning:
// See: https://mongoosejs.com/docs/deprecations.html#findandmodify
mongoose.set('useFindAndModify', false);

// This is a function we can use to wrap our existing async route functions so they automatically catch errors
// and call the next() handler
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

// This is middleware that will run before every request
app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    // Calling next() makes it go to the next function that will handle the request
    next();
});

app.use('/api/notes/:id', (req, res, next) => {
    console.log("Request involving a specific note")
    next();
});

//get notes
app.get('/api/notes', wrapAsync(async function (req,res) {
    const notes = await Note.find({});
    res.json(notes);
}));

//get users
app.get('/api/users', wrapAsync(async function (req,res) {
    const users = await User.find({});
    res.json(users);
}));

//get note by id
app.get('/api/notes/:id', wrapAsync(async function (req,res, next) {
    let id = req.params.id;
    if (mongoose.isValidObjectId(id)) {
        const note = await Note.findById(id);
        if (note) {
            res.json(note);
            return;
        } else {
            throw new Error('Note Not Found');
        }
    } else {
        throw new Error('Invalid Note Id');
    }
}));

//add note
app.post(`/api/notes`, wrapAsync(async function (req, res) {
    console.log("Posted with body: " + JSON.stringify(req.body));
    const newNote = new Note({
        text: req.body.text,
        date: req.body.date
    })
    await newNote.save();
    res.json(newNote);
}));

//update note
app.put('/api/notes/:id', wrapAsync(async function (req, res) {
    const id = req.params.id;
    console.log("PUT with id: " + id + ", body: " + JSON.stringify(req.body));
    await Note.findByIdAndUpdate(id, {'text': req.body.text, "date": req.body.date},
        {runValidators: true});
    res.sendStatus(204);
}));

//delete note
app.delete('/api/notes/:id', wrapAsync(async function (req, res) {
    const id = req.params.id;
    const result = await Note.findByIdAndDelete(id);
    console.log("Deleted successfully: " + result);
    res.json(result);
}));

//add user
app.post(`/api/users`, wrapAsync(async function (req, res) {
    console.log("Posted with body: " + JSON.stringify(req.body));
    const newNote = new User({
        name: req.body.name,
        email: req.body.email,
        location: req.body.location
    })
    await newNote.save();
    res.json(newNote);
}));

//update user
app.put('/api/users/:id', wrapAsync(async function (req, res) {
    const id = req.params.id;
    console.log("PUT with id: " + id + ", body: " + JSON.stringify(req.body));
    await Note.findByIdAndUpdate(id, {
            'name': req.body.name,
            "email": req.body.email,
            'location': req.body.location
        },
        {runValidators: true});
    res.sendStatus(204);
}));

//delete user
app.delete('/api/users/:id', wrapAsync(async function (req, res) {
    const id = req.params.id;
    const result = await Note.findByIdAndDelete(id);
    console.log("Deleted successfully: " + result);
    res.json(result);
}));

app.use((err, req, res, next) => {
    console.log("Error handling called");
    // If want to print out the error stack, uncomment below
    // console.error(err.stack)
    // Updating the statusMessage with our custom error message (otherwise it will have a default for the status code).
    res.statusMessage = err.message;

    if (err.name === 'ValidationError') {
        res.status(400).end();
    }
    else {
        // We could further interpret the errors to send a specific status based more error types.
        res.status(500).end();
    }
})

port = process.env.PORT || 5000;
app.listen(port, () => { console.log('server started!')});