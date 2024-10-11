require('dotenv').config();
const express = require('express')
const app = express()
const PORT = 4000;
const jwt = require('jsonwebtoken')

app.use(express.json()); // middleware that parses Strings to JSON

let refreshTokens = []; // normally tho we store the refresh tokens in a DB / Redis cache

app.post('/token', (req, res) => {
    const refreshToken = req.body.token;

    if (refreshTokens == null) return res.sendStatus(401); //Unauthorized (acutually unauthenticated) - the client's identity is unknown to the server
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403); //Forbidden - the client's identity is known to the server
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        const accessToken = generateAccessToken({ name: user.name }); // not only (user) because it has other things with it
        res.json({ accessToken: accessToken });


    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.sendStatus(204); // successfully deleted
})

app.post('/login', (req, res) => {
    //Authenticate User using username and password, See Video

    const username = req.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);
    res.json({
        accessToken: accessToken, refreshToken: refreshToken
    });

});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' }); //normally 10m~15m

}


/*
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
*/


app.listen(
    PORT, () => console.log(`it's alive on http://localhost:${PORT}`)
); // a call to the api

