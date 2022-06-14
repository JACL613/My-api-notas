const {Schema,model} = require('mongoose')

const SchemaUser = new Schema({
    name: {type: String , require: true},
    nameuser: {type: String , require: true},
    passwordHash: {type: String , require: true},
    date: {type: Date},
    note:[ {type: Schema.Types.ObjectId , ref: 'Note'}],
    refAvatar: {type:Number, require: true, default: 0},

})

SchemaUser.set('toJSON' , {
    transform:(doc,returnObj) => {
        returnObj.id = returnObj._id
        delete returnObj._id
        delete returnObj.__v
        delete returnObj.passwordHash
    }
})
const User = model('User',SchemaUser)
module.exports = User