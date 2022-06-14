const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()
const User = require('../../databases/models/Model.User')

userRouter.get('/' ,(req , res)=>{
    res.send('welcomen to api notes')
})

userRouter.get('/oneUser', async (req, res) => {
    const authorization = req.get('authorization')
    let token = ''

 
    if(authorization && authorization.toLowerCase().startsWith('bearer')){
        token = authorization.substring(7)
    }

    const decodedToken = jwt.verify(token , process.env.SECRET)
    if(!token || !decodedToken){
        return res.status(400).json({error: 'Invalid token'})
    }
    const {id: userId} = decodedToken
    const user = await User.findById(userId).populate('note', {
        title: 1,
        content: 1,
        
    })
    res.send(user)
})

userRouter.post('/create', async (req, res) => {
    const {body} = req
    const {name, nameuser, password,refAvatar} = body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password,saltRounds)
    const query = await User.find({
        $or:[
            {name},
            {nameuser: nameuser},
            {passwordHash: passwordHash}
        ]
    })
    if(query[0]){
        const passwordCorrect = query[0]
        ? await bcrypt.compare(password , query[0].passwordHash)    
        : false
        console.log(query[0].nameuser)
        if(query[0].nameuser == nameuser || !passwordCorrect) {
            return res.status(400).json({message: 'Invalid password o username have create'})
        }
    }
            const user = new User({
            name,
            nameuser,
            passwordHash,
            date: new Date().getTime(),
            refAvatar
        })
        const saveUser = await user.save()
    
     res.status(200).json(saveUser)

})

userRouter.post('/login' , async (req, res) => {
    const {body} = req
    const {nameuser, password} = body
    console.log(nameuser)
    const user = await User.findOne({nameuser: nameuser})
    console.log(user)
    const passwordCorrect = user == null
    ? false
    : await bcrypt.compare(password , user.passwordHash)

    if(!passwordCorrect) {
        res.status(401).json({errors: 'invalid user or password'})
    }
    console.log(user)
    const userForToken = {
        id: user._id,
        nameuser : user.nameuser
    }   
    const token = jwt.sign(userForToken,process.env.SECRET)
  
    res.send({
        name: user.name,
        username: user.nameuser,
        token,
        refAvatar:user.refAvatar


    })

})

module.exports = userRouter