require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const app = express();

require('../databases/connectionsDB')

const noteRouter = require('./controllers/note.routes')
const userRouter = require('./controllers/user.routes')

app.use(express.json())
app.use(morgan('dev'))
app.use(cors());

app.set('port', process.env.PORT || 3001);

app.use('/api/users' , userRouter);
app.use('/api/notes' , noteRouter);

app.listen(app.get('port'), ()=> {
    console.log('listening on port '+ app.get('port'));
})
