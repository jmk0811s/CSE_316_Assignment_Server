var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NoteSchema = new Schema(
    {
        text: {type: String, required: true},
        lastUpdatedDate: {type: Date, required: true},
        creator: {type: Schema.Types.ObjectID, ref: "User", required: true}
    }
);

module.exports = mongoose.model('Note', NoteSchema);
