var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        first_name: {type: String, required: true},
        last_name: {type: String, required: true},
        email: {type: String},
        location: {type: String}
    }
);

UserSchema
    .virtual('name')
    .get(function () {
        return this.first_name + ' ' + this.last_name;
    });

module.exports = mongoose.model('User', UserSchema);
