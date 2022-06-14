const jwt = require('jsonwebtoken')
const noteRouter = require('express').Router()
const Note = require('../../databases/models/Model.Note')
const User = require('../../databases/models/Model.User')



noteRouter.get('/', async (req, res) => {
    const autorization = req.get('authorization')
    let token = ''

 
    if(autorization && autorization.toLowerCase().startsWith('bearer')){
        token = autorization.substring(7)
        console.log(token)
    }
    if(!token){
        return res.status(400).json({menssage: 'Invalid token'})
    }
    const decodedToken = jwt.verify(token , process.env.SECRET)
    if(!token || !decodedToken){
        return res.status(400).json({error: 'Invalid token'})
    }
    const Notes = await Note.find({}).populate({
        path: 'userAuthor',
        select:{'name':1 , nameuser:1 , _id: 0 }
    })
    let filterNote = Notes.filter(item => item.userAuthor.nameuser == decodedToken.nameuser)
    console.log(decodedToken)
    res.json(filterNote)
})
noteRouter.get('/oneNote/:id', async (req, res) => {
    const id = req.params.id
     const query = await Note.findById(id).populate('userAuthor', {
        name: 1,
        nameuser:1,
        _id:0
    })
    const {userAuthor: user} = query
     res.send(noteNew + user.nameuser)
})

noteRouter.post('/createNote', async (req,res ) => {
    const {body} = req
    const {
        title ,
        content,
    } = body
    const autorization = req.get('authorization')
    let token = ''

 
    if(autorization && autorization.toLowerCase().startsWith('bearer')){
        token = autorization.substring(7)
        console.log(token)
    }
    if(!token){
        return res.status(400).json({menssage: 'Invalid token'})
    }
    const decodedToken = jwt.verify(token , process.env.SECRET)
    if(!token || !decodedToken){
        return res.status(400).json({error: 'Invalid token'})
    }
    const {id: userId} = decodedToken
    const user = await User.findById(userId)
    if(!content || !title){
        console.log(title,content)
        return res.status(400).json({error: "Invalid content or title"})
    }
    const query = await Note.find({
        $or:[
            {title: title},
            {content: content}
        ],
    })
     if(query[0]){
         console.log(query)
        if(query[0].title == title || query[0].content == content){
            return res.status(400).json({error: "Invalid content or title have create"})
    
         }
     }
    const noteNew = new Note({
        title,
        content,
        date: new Date().getTime(),
        userAuthor: user.toJSON().id
    })
    const saveNote = await noteNew.save()
    user.note = user.note.concat(saveNote._id)
    await user.save()

    res.status(200).json(noteNew)
})
noteRouter.delete('/:id' , async (req,res) => {
    const authorization = req.get('authorization')
    let token = ''

 
    if(authorization && authorization.toLowerCase().startsWith('bearer')){
        token = authorization.substring(7)
    }
    if(!token){
        return res.status(400).json({error: 'Invalid token'})
    }
    const decodedToken = jwt.verify(token , process.env.SECRET)
    if(!token || !decodedToken){
        return res.status(400).json({error: 'Invalid token'})
    }
    const {id: noteId} = req.params
    console.log(noteId)
    const query = await Note.findById(noteId).populate({path:'userAuthor' ,
     select:{
        name: 1,
        nameuser:1,
        _id:0
    }})
    const {nameuser} = decodedToken
    const {userAuthor: user} = query
    if(nameuser != user.nameuser){
        return res.status(400).json({error: 'Usuario Invalid'})

    }
    
    const noteDelete = await Note.findByIdAndRemove(noteId)
    res.send(noteDelete)
})
noteRouter.put('/:id' , async (req,res) => {
    const authorization = req.get('authorization')
    let token = ''

 
    if(authorization && authorization.toLowerCase().startsWith('bearer')){
        token = authorization.substring(7)
    }
    if(!token){
        return res.status(400).json({error: 'Invalid token'})
    }
    const decodedToken = jwt.verify(token , process.env.SECRET)
    if(!token || !decodedToken){
        return res.status(400).json({error: 'Invalid token'})
    }
    const {body} = req
    const noteId = req.params.id
    const {title,content} = body
    const {id: userId} = decodedToken

    const query = await Note.findById(noteId).populate('userAuthor', {
        name: 1,
        nameuser:1,
        _id:0
    })
    const {nameuser} = decodedToken
    const {userAuthor: user} = query
    if(nameuser != user.nameuser){
        return res.status(400).json({error: 'Usuario Invalid'})

    }else{
    

    const newNote = {
        title,
        content,
        date: new Date().getTime(),
        userAuthor: userId
    }
    const noteUpdate = await Note.findByIdAndUpdate({_id:noteId},newNote)
    return res.send(noteUpdate)

    }


})
module.exports = noteRouter;

