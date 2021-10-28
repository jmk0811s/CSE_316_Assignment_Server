var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name: {type: String, required: true},
        email: {type: String},
        location: {type: String}
    }
);

module.exports = mongoose.model('User', UserSchema);
