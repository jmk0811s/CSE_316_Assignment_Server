const express = require('express');
const mongoose = require('mongoose');
const Note = require('./models/note');
const User = require('./models/user');

const server = express();
const bodyParser = require('body-parser');
server.use(bodyParser.json());

const session = require('express-session');
const MongoStore = require('connect-mongo');

var dbURL = process.env.MONGO_URL || 'mongodb://localhost:27017/CSE_316_Assignment_DB'; // insert your database URL here
mongoose.connect(dbURL, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const sessionSecret = 'make a secret string';

// Create Mongo DB Session Store
const store = MongoStore.create({
    mongoUrl: dbURL,
    secret: sessionSecret,
    touchAfter: 24 * 60 * 60
})

// Changing this setting to avoid a Mongoose deprecation warning:
// See: https://mongoosejs.com/docs/deprecations.html#findandmodify
mongoose.set('useFindAndModify', false);

// Setup to use the express-session package
const sessionConfig = {
    store,
    name: 'session',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
        // later you would want to add: 'secure: true' once your website is hosted on HTTPS.
    }
}

server.use(session(sessionConfig));

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

server.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(req.method, req.path);
    next();
});

server.use('/api/notes/:id', (req, res, next) => {
    console.log("Request involving a specific note")
    next();
});

const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send("Need to login");
    }
    next();
}

/*
 *  User
 */

//get users @
server.get('/api/users', wrapAsync(async function (req, res) {
    const users = await User.find({});
    res.json(users);
}));

//get current user @
server.get('/api/currentuser', wrapAsync(async function (req, res) {
    if (req.session.userId === undefined) {
        res.json({});
    }
    else {
        const currentUser = await User.findById(req.session.userId);
        res.json(currentUser);
    }
}));

//update user
server.put('/api/users/:id', requireLogin, wrapAsync(async function (req, res) {
    const id = req.params.id;
    console.log("PUT with id: " + id + ", body: " + JSON.stringify(req.body));
    await User.findByIdAndUpdate(id, {
            'name': req.body.name,
            "email": req.body.email,
            'location': req.body.location,
            'profile_url': req.body.profile_url,
            'password': req.body.password
        },
        {runValidators: true});
    res.sendStatus(204);
}));

//delete user
server.delete('/api/users/:id', wrapAsync(async function (req, res) {
    const id = req.params.id;
    const result = await Note.findByIdAndDelete(id);
    console.log("Deleted successfully: " + result);
    res.json(result);
}));

/*
 * Login
 */

//register @
server.post('/api/users',  wrapAsync(async function (req, res) {
    const { email, password } = req.body;
    const user = new User({ email, password })
    await user.save();
    req.session.userId = user._id;
    // Note: this is returning the entire user object to demo, which will include the hashed and salted password.
    // In practice, you wouldn't typically do this – a success status would suffice, or perhaps just the user id.
    res.json(user);
}));


//login @
server.post('/api/login', wrapAsync(async function (req, res) {
    const { email, password } = req.body;
    const user = await User.findAndValidate(email, password);
    if (user) {
        req.session.userId = user._id;
        res.sendStatus(204);
    }
    else {
        res.sendStatus(401);
    }
}));

//logout @
server.post('/api/logout', requireLogin, wrapAsync(async function (req, res) {
    req.session.userId = null;
    res.sendStatus(204);
}));

/*
 * Note
 */

//get notes @
server.get('/api/notes', requireLogin, wrapAsync(async function (req, res) {
    const notes = await Note.find({creator: req.session.userId});
    res.json(notes);
}));

//get note by id
server.get('/api/notes/:id', wrapAsync(async function (req, res, next) {
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

//add note @
server.post(`/api/notes`, requireLogin, wrapAsync(async function (req, res) {
    console.log("Posted with body: " + JSON.stringify(req.body));
    const newNote = new Note({
        text: req.body.text,
        lastUpdatedDate: req.body.lastUpdatedDate,
        creator: req.session.userId
    })
    await newNote.save();
    res.json(newNote);
}));

//update note @
server.put('/api/notes/:id', requireLogin, wrapAsync(async function (req, res) {
    const id = req.params.id;
    console.log("PUT with id: " + id + ", body: " + JSON.stringify(req.body));
    await Note.findByIdAndUpdate(id,
        {
            "text": req.body.text,
            "lastUpdatedDate": req.body.lastUpdatedDate,
            "creator": req.session.userId
        },
        {runValidators: true});
    res.sendStatus(204);
}));

//delete note
server.delete('/api/notes/:id', requireLogin, wrapAsync(async function (req, res) {
    const id = req.params.id;
    const result = await Note.findByIdAndDelete(id);
    console.log("Deleted successfully: " + result);
    res.json(result);
}));




server.use((err, req, res, next) => {
    console.log("Error handling called");
    res.statusMessage = err.message;

    if (err.name === 'ValidationError') {
        res.status(400).end();
    }
    else {
        res.status(500).end();
    }
})

port = process.env.PORT || 5000;
server.listen(port, () => { console.log('server started!')});