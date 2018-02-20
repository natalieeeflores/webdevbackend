// following	GET, PUT, DELETE	following.js
const express = require('express')
const bodyParser = require('body-parser')
const Following = require('../model.js').Following
const User = require('../model.js').User
const isLoggedIn = require('./auth.js').isLoggedIn
const Profile = require('../model.js').Profile

const getFollowing = (req, res) => {
  const user = req.params.user
  if (user) {

    Following.find({username: user }, function(err, following) {
      res.send({ username: req.user, following: following[0].following })
    })
  } else {
    Following.find({ username: req.user }, function(err, following) {
      res.send({ username: req.user, following: following[0].following})
    })
  }

}

const putFollowing = (req, res) => {

  Profile.find({username: req.params.user}).exec((err, data) => {
    if(data.length == 0) {
      res.sendStatus(404)
      return
    } else {
    Following.findOneAndUpdate({ username: req.user },
      { $push: { following: req.params.user } }, (err, data) => {
        console.log(data)
      })

      Following.find({ username: req.user }).exec((err, data) => {
        res.send({username: req.user, following: data[0].following})
      })
    }
  })
}

const deleteFollowing = (req, res) => {
  Following.findOneAndUpdate({ username: req.user },
  { $pullAll: {following: [req.params.user] } }, (err, data) => { })

  Following.find({ username: req.user }).exec((err, data) => {
    res.send({username: req.user, following: data[0].following})
  })
}


module.exports = app => {
  app.get('/following/:user?', isLoggedIn, getFollowing)
  app.put('/following/:user', isLoggedIn, putFollowing)
  app.delete('/following/:user', isLoggedIn, deleteFollowing)
}
