#! /usr/bin/env node

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

var async = require('async')
var Note = require('./models/note')
var User = require('./models/user')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var notes = []
var users = []

function noteCreate(text, date, cb) {
    notedetail = {
        text: text,
        lastUpdatedDate: date
    }

    var note = new Note(notedetail);
    console.log(note);

    note.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log("New Note: " + note);
        notes.push(note)
        cb(null, note)
    });
}

function userCreate(name, email, location, cb) {
    userdetail = {
        name: name
    }
    if (email != false) userdetail.email = email;
    if (location != false) userdetail.location = location;

    var user = new User(userdetail);

    user.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log("New User: " + user);
        users.push(user)
        cb(null, user)
    });
}

function createNotes(cb) {
    async.series([
            function(callback) {
                noteCreate("Example Note 1", Date.now(), callback);
            },
            function(callback) {
                noteCreate("Example Note 2", Date.now(), callback);
            },
            function(callback) {
                noteCreate("Example Note 3", Date.now(), callback);
            }
        ],
        cb);
}

function createUsers(cb) {
    async.series([
        function(callback) {
            userCreate("Minki Jeon", "minki.jeon@stonybrook.edu", "Incheon Songdo", callback);
        }
        ],
        cb);
}

async.series([
    createNotes,
    createUsers
],

function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('success');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




