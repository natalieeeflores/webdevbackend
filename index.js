const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

const hello = (req, res) => res.send({ hello: 'world' })

const app = express()
app.use(bodyParser.json())
app.use(cookieParser())

const enableCORS = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers','Authorization, Content-Type, X-Request-With, X-Session-Id')
  res.header('Access-Control-Expose-Headers', 'Location, X-Session-Id')
  if(req.method === 'OPTIONS') {
      res.status(200).send("OK")
  } else {
      next()
  }
}

app.use(enableCORS);
app.use(session({ secret: "secret message!" }))
app.use(passport.initialize())
app.use(passport.session())
app.get('/', hello)
require('./src/auth').reg(app)
require('./src/profile')(app)
require('./src/articles')(app)
require('./src/following')(app)
require("./uploadCloudinary.js").setup(app)


// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
     const addr = server.address()
     console.log(`Server listening at http://${addr.address}:${addr.port}`)
})
