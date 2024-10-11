require('dotenv').config();
const express = require('express')
const app = express()
const PORT = 3000;
const jwt = require('jsonwebtoken')

app.use(express.json()); // middleware that parses Strings to JSON

const posts = [{
    username: 'Ahmad',
    title: 'First Post'

},
{
    username: 'Sara',
    title: 'Second Post'

}]

app.get('/posts', authenticateToken, (req, res) => {
    req.user
    res.json(posts.filter(posts => posts.username === req.user.name))
}

)

// Middleware to Authenticate Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] //Bearer TOKEN
    if (token == null) return res.sendStatus(401) // Forbidden/Not Authorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403) // token no longer valid
        req.user = user;
        next(); //to move on from our middleware
    }
    )
}


app.listen(
    PORT, () => console.log(`it's alive on http://localhost:${PORT}`)
); // a call to the api

