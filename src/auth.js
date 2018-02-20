const User = require('../model.js').User
const md5 = require('md5')
const Profile = require('../model.js').Profile
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const Following = require('../model.js').Following
const Auth = require('../model.js').Auth
const Article = require('../model.js').Article

var currentUser = null;
var defaultUser = 'natbat'
const config = {
	clientID: "196080287792815",
  clientSecret: "33cf7eeef5a138ca29e2de054914518f",
  callbackURL: "https://webdevbackend.herokuapp.com/auth/facebook/callback",
	profileFields: ['email']
}

const sessionUser = {}
const cookieKey = 'sid'
let users = {}
let key

const register = (req, res) => {
	console.log('about to register????????')
	console.log(req.body)
	const username = req.body.username
	const password = req.body.password
	const userSalt = Math.random().toString(36).substring(7)
	const userHash = md5(password + userSalt)

	const newUser = User({
		userName: username,
		salt: userSalt,
		hash: userHash,
		auth: [{ auth: 'rice', username: username }],
		merged: false
	})

	newUser.save(function(err) {
		if (err) throw err;
		console.log('User created')
	})

	const newProfile = Profile({
		username: username,
		email: req.body.email,
		dob: new Date(req.body.dob),
		zipcode: req.body.zipcode,
		phone: req.body.phone,
		display: req.body.display_name
	})

	newProfile.save(function(err) {
		if (err) throw err;
		console.log('Profile created')
	})

	const newFollowing = Following({
		username: username,
		following: []
	})

	newFollowing.save()

	const sessionKey = md5('mySecretMessage' + new Date().getTime() + username)
	sessionUser[sessionKey] = newUser
	res.cookie(cookieKey, sessionKey, { maxAge: 3600*1000, httpOnly: true })
	console.log(res.cookies)

	res.send({username: username, result: "success"})
}

const login = (req, res) => {
	const username = req.body.username;
	const password = req.body.password

	if (!username || !password) {
		console.log('either password or username not included')
		res.sendStatus(400)
		return
	}

	User.find({ userName: username }, function(err, user) {
		if (err) return handleError(err);
		const userObj = user[0]

		if (!userObj || userObj.userName != username) {
			console.log('username issue')
			res.sendStatus(401)
			return
		}

		const userHash = userObj.hash
		const newHash = md5(password + userObj.salt)

		if (userHash != newHash) {
			console.log('passwords do not match')
			res.sendStatus(400)
			return
		}

		currentUser = userObj.userName

		const sessionKey = md5('mySecretMessage' + new Date().getTime() + userObj.username)
    sessionUser[sessionKey] = userObj
		res.cookie(cookieKey, sessionKey, { maxAge: 3600*1000, httpOnly: true })

		var msg = { username: userObj.userName, result: 'success'}
		res.status(200).send(msg)
	})
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		console.log('oauth')
		var username = sessionUser[key]
		if (username) {
			req.user = username
			return next()
		}
	}
	var id = req.cookies['sid']
	if (!id) {
		console.log('no id!')
		return res.sendStatus(401)
	} else {
		var username = sessionUser[id].userName
		if (username) {
			req.user = username
			return next()
		} else {
			console.log('no username')
			return res.sendStatus(401)
		}
	}
}

const logout = (req, res) => {
	//oauth
	if (req.isAuthenticated()) {
		req.session.destroy(() => {
      res.status(200).send('OK')
			return
    })
	} else {
		//regular
		var id = req.cookies['sid']
		if (id) {
			delete sessionUser[id]
			res.clearCookie('sid')
			res.status(200).send('OK')
		} else {
			console.log('no id')
			res.sendStatus(400)
		}
	}
}

passport.serializeUser(function(user, done) {
	key = user.id
	const email = user.emails[0].value
	sessionUser[key] = email
	User.find({ auth: { $elemMatch: { username: email, auth: 'facebook' } } }).exec((error, items) => {
		//new user
		if (items.length == 0) {

				let new_User = new User({
					userName: email,
					auth: [{ auth: 'facebook', username: email }]
				})
				new_User.save()
				let new_Following = new Following({
					username: email,
					following: []
				})
				new_Following.save()
				let new_Profile = new Profile({
					username: email,
					email: email,
				})
				new_Profile.save()
		}
	})
	users[user.id] = user
	done(null, user.id)
})

passport.deserializeUser(function(id, done) {
	var user = users[id]
	done(null, user)
})

passport.use(new FacebookStrategy(config,
	function(token, refreshToken, profile, done) {
		process.nextTick(function() {
			console.log('gets here')
			console.log(profile)
			return done(null, profile)
		})
	})
)

const link = (req, res) => {
	console.log('linking')
	if (req.isAuthenticated()) {
		const oauthUser = req.user.emails[0].value
		console.log("oauth User: ", oauthUser)
		Profile.find({ email: oauthUser, userName: { $ne: oauthUser } }).exec((err, user) => {
			if (user !== "undefined") {
				const rUser = user.filter(x => {
					return x.username != oauthUser
				})
				const riceauthUser = rUser[0].username
				mergeUser(req, res, oauthUser, riceauthUser)
			}
		})
	} else {
		const riceUser = req.body.user
		Profile.find({ username: riceUser }).exec((err, user) => {
			const oauthUser = user[0][email]
			mergeUser(req, res, riceUser, oauthUser)
		})
	}
}

const unlink = (req, res) => {
	User.findOne({ auth: { $elemMatch: { username: req.user }}}).exec((err, data) => {
		data.update({ auth: data.auth.filter((auth) => {
				return auth.type != 'facebook'
			})
		})
	})
}

const mergeUser = (req, res, mainUser, linkedUser) => {
	User.findOne({ userName: linkedUser }).exec((err, linked) => {
		User.findOne({ userName: mainUser }).exec((err, main) => {
			console.log(main)
			console.log(linked)
			console.log(linked.auth.concat(main.auth))
			// User.findOneAndUpdate({ userName: mainUser }, { auth: main.auth.concat(linked.auth)})
			main.update({ auth: main.auth.concat(linked.auth)}, {}, (err, raw) => {
                        console.log("Errors? ", err)
                    })
			linked.remove((err, data) => {
				console.log('removed user')
			})
			mergeFollowing(req, res, mainUser, linkedUser)
		})
	})
}

const mergeFollowing = (req, res, mainUser, linkedUser) => {
	console.log(linkedUser)
	console.log(mainUser)
	Following.findOne({ username: linkedUser }).exec((err, linkedFollowing) => {
		Following.findOne({ username: mainUser }).exec((err, mainFollowing) => {
			mainFollowing.update(
				{ following: linkedFollowing.following.concat(mainFollowing.following) }, {}, (err) => {
					console.log(err)
				})
			linkedFollowing.remove((err, data) => {
				console.log('remove following')
			})
			mergeArticles(req, res, mainUser, linkedUser)
		})
	})
}

const mergeArticles = (req, res, mainUser, linkedUser) => {
	Article.find({ author: linkedUser }).exec((err, linkedArticles) => {
		console.log(linkedArticles)
		linkedArticles.map((article) => {
			const comments = article.comments.map((comment) => {
				comment.author = mainUser
			})

			article.update({ author: mainUser, comments: comments }, {}, (err) => {
				console.log(err)
			})
		})
		console.log(linkedArticles)
		mergeProfile(req, res, mainUser, linkedUser)
	})
}

const mergeProfile = (req, res, mainUser, linkedUser) => {
	Profile.findOne({ username: linkedUser }).remove((err, data) => {
		if (err) throw err;
		console.log('deleted profile')
	})

	User.findOneAndUpdate({ userName: mainUser }, { merged: true })
	res.send({ username: mainUser, result: 'success'})
}

const hello = (req, res) => {
	res.send('hello world')
}

const updatePassword = (req, res) => {
	// console.log(req.body)
	if (!req.body.password) {
		res.sendStatus(400)
		return
	}
	const salt = Math.random().toString(36).substring(7)
	const hash = md5(req.body.password + salt)
	console.log(req.user)
	User.findOneAndUpdate({ userName: req.user }, { salt: salt, hash: hash}).exec((err, user) => {
		console.log('updated password')
		console.log(user)
	})
	res.send({ username: req.user, result: "success"})
}

const getUser = (req, res) => {
	User.find({ userName: req.user }, function(err, user) {
		res.send({ user: user })
	})
}

module.exports = {
	reg: (app) => {
		app.get('/auth/facebook',
		passport.authenticate('facebook', { scope: ['email'] }));

		app.get('/auth/facebook/callback',
		passport.authenticate('facebook', { failureRedirect: '/' }),
		function(req, res) {
			console.log('about to redirect')
		  // Successful authentication, redirect home.
		  res.redirect('http://tall-jump.surge.sh/#/main');
		});
		app.post('/register', register)
		app.post('/login', login)
		app.put('/logout', logout)
		app.put('/password', isLoggedIn, updatePassword)
		app.post('/link', link)
		app.get('/user', isLoggedIn, getUser)
	},
	isLoggedIn: isLoggedIn
}
