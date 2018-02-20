// headline	GET, PUT	profile.js
// headlines	GET	profile.js
// email	GET, PUT	profile.js
// dob	GET	profile.js
// zipcode	GET, PUT	profile.js
// avatars	GET	profile.js
// avatar	PUT	profile.js
const Profile = require('../model.js').Profile
const isLoggedIn = require('./auth.js').isLoggedIn
const uploadImage = require('../uploadCloudinary.js').uploadImage

const getHeadlines = (req, res) => {

  const requestedUsers = req.params.users ? req.params.users.split(',') : [req.user]

  Profile.find({
    username: { $in: requestedUsers }
  }, function(err, profiles) {
    if (err) return handleError(err);

    var headlines = []
    profiles.forEach(profile => {
      headlines.push({ username: profile.username, headline: profile.headline })
    })
    res.send({ headlines: headlines})
  })
}

const getEmail = (req, res) => {
  Profile.find({ username: req.params.user }, function(err, profile) {
    if (err) throw err;

    res.send({ username: profile[0].username, email: profile[0].email })
  })
}

const getDob = (req, res) => {
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ username: profile[0].username, dob: profile[0].dob })
  })
}

const getZipcode = (req, res) => {
  Profile.find({ username: req.params.user }, function(err, profile) {
    res.send({ username: profile[0].username, zipcode: profile[0].zipcode })
  })
}

const getAvatars = (req, res) => {
  const requestedUsers = req.params.users ? req.params.users.split(',') : [req.user]
  Profile.find({ $in: requestedUsers }, function(err, profiles) {
    image_urls = []

    profiles.forEach(profile => {
      image_urls.push({ username: profile.username, avatar: profile.avatar})
    })
    res.send({ avatars: image_urls })
  })
}

const updateHeadline = (req, res) => {
  console.log(req.user)
  console.log(req.body.headline)
  Profile.update({ username: req.user }, { headline: req.body.headline },
    function(err) {
      if (err) throw err;
    })
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ username: profile[0].username, headline: profile[0].headline })
  })
}

const updateEmail = (req, res) => {
  Profile.update({ username: req.user}, { email: req.body.email },
    function(err) {
      if (err) throw err;
  })
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ username: profile[0].username, email: profile[0].email })
  })
}

const updateZipcode = (req, res) => {
  Profile.update({ username: req.user }, { zipcode: parseInt(req.body.zipcode) },
  function(err) {
    if (err) throw err;
  })
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ username: profile[0].username, zipcode: profile[0].zipcode })
  })
}

const updateDisplay = (req, res) => {
  Profile.update({ username: req.user }, { display: req.body.display },
  function(err) {
    if (err) throw err;
  })
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ username: profile[0].username, display: profile[0].display })
  })
}

const updatePhone = (req, res) => {
  console.log('updating phone', req.user)
  Profile.update({ username: req.user }, { phone: req.body.phone },
  function(err) {
    if (err) throw err;
  })
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ username: profile[0].username, zipcode: profile[0].phone })
  })
}

const updateAvatars = (req, res) => {
  Profile.findOneAndUpdate({ username: req.user },
    { avatar: req.fileurl }, (err, data) => {
      data['avatar'] = req.fileurl
      res.send({ username: data['username'], avatar: data['avatar'] })
    })
}

const getCurrentProfile = (req, res) => {
  Profile.find({ username: req.user }, function(err, profile) {
    res.send({ profile: profile[0]})
  })
}

const getAllUsers = (req, res) => {
  Profile.find(function(err, profile) {
    res.send({ profiles: profile })
  })
}

module.exports = app => {
  app.get('/headlines/:users?', getHeadlines)
  app.put('/headline', isLoggedIn, updateHeadline)
  app.get('/email/:user?', getEmail)
  app.put('/email', isLoggedIn, updateEmail)
  app.get('/dob', isLoggedIn, getDob)
  app.get('/zipcode/:user?', getZipcode)
  app.put('/zipcode', isLoggedIn, updateZipcode)
  app.get('/avatars/:user?', getAvatars)
  app.put('/avatars', uploadImage('avatar'), isLoggedIn, updateAvatars)
  app.get('/profile', isLoggedIn, getCurrentProfile)
  app.get('/users', getAllUsers)
  app.put('/display', isLoggedIn, updateDisplay)
  app.put('/phone', isLoggedIn, updatePhone)
}
