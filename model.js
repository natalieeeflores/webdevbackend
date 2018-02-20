// this is model.js
var mongoose = require('mongoose')
require('./db.js')

var commentSchema = new mongoose.Schema({
	commentId: Number, author: String, date: Date, text: String
})
var articleSchema = new mongoose.Schema({
	id: Number, author: String, img: String, date: Date, text: String,
	comments: [ commentSchema ]
})

var authSchema = new mongoose.Schema({
	auth: String, username: String
})

var userSchema = new mongoose.Schema({
	userName: String, salt: String, hash: String, auth: [ authSchema ], merged: Boolean
})

var profileSchema = new mongoose.Schema({
	username: String, email: String, dob: Date, zipcode: Number, headline: String,
	phone: String, display: String, avatar: String
})

var followingSchema = new mongoose.Schema({
	username: String, following: [ String ]
})

exports.Article = mongoose.model('article', articleSchema)
exports.User = mongoose.model('user', userSchema)
exports.Profile = mongoose.model('profile', profileSchema)
exports.Comment = mongoose.model('comment', commentSchema)
exports.Following = mongoose.model('following', followingSchema)
exports.Auth = mongoose.model('auth', authSchema)
