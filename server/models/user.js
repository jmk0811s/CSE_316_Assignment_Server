var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        name: {type: String},
        email: {type: String, trim: true, unique: true},
        location: {type: String},
        profile_url: {type: String},
        password: {type: String, required: true, minlength: 6}
    }
);

UserSchema.statics.findAndValidate = async function (email, password) {
    const user = await this.findOne({email});
    if(!user) {
        return false;
    }
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : false;
}

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

module.exports = mongoose.model('User', UserSchema);
