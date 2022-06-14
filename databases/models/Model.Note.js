const {Schema,model} = require('mongoose')

const SchemaNote = new Schema({
    title: {type: String , require:true},
    content: {type: String, require:true},
    date: {type: Date, require:true},
    userAuthor:{type: Schema.Types.ObjectId,ref: 'User'}
})
SchemaNote.set('toJSON' , {
    transform:(doc,returnObj) => {
        returnObj.id = returnObj._id
        delete returnObj._id
        delete returnObj.__v
    }
})

const Note = model('Note',SchemaNote)
module.exports = Note