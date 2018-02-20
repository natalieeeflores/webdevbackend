const Article = require('../model.js').Article
const isLoggedIn = require('./auth.js').isLoggedIn
const Comment = require('../model.js').Comment
const uploadImage = require('../uploadCloudinary.js').uploadImage

var articles = [ { id: 1, author: "Mack", text: "This is my first article" },
{ id: 2, author: "Max", text: "This is Max's article" },
{ id: 3, author: "Natalie", text: "This is Natalie's article" }
]

function callback() {
	Article.find(function(err, article) {
		console.log(article)
	})
}

const addArticle = (req, res) => {
	var newArticle
	console.log(req)
	Article.find(function(err, article) {
		if (err) return handleError(err);

		var image
		if (req.fileurl) {
			image = req.fileurl
		} else {
			image = ''
		}
		console.log(image)
		newArticle = Article({
			id: article.length,
			author: req.user,
			img: image,
			date: new Date(),
			text: req.body.text
		})

		newArticle.save(function(err) {
		 if (err) throw err;
		 console.log('Article created')
		})

		article.push(newArticle)
		res.send({ articles: article})
	})
}

const getArticles = (req, res) => {
	const id = req.params.id
	console.log(id)

	if (!id) {
		Article.find(function(err, article) {
			if (err) throw err;
			res.send({ articles: article })
			return
		})
	} else {
		Article.find(parseInt(id) ? { _id: id } : { id: id },
		function(err, article) {
			if (err) throw err;

			// console.log(article)
			if (article.length !== 0) {
				// console.log('supposed to return here')
				res.send({ articles: article })
				return
			}
		})
	}
}


const putArticle = (req, res) => {
	const id = req.params.id
	if (id) {

		console.log(req.body.commentId)
		if (req.body.commentId === undefined) {
			console.log('editting article')
			Article.update({ author: req.user, id: id }, { text: req.body.text },
				function(err) {
					if (err) throw err;
				})

			Article.find({id: id}, function(err, article) {
				if (err) throw err
				res.send({ articles: article })
			})
		} else {
			console.log('should go here....')
			Article.findOne({id: id}, function(err, article) {
				if (err) throw err;

				console.log(article.comments)
				if (req.body.commentId == -1) {
					console.log('new comment')
					newComment = {
						commentId: article.comments.length,
						author: req.user,
						date: Date(),
						text: req.body.text }
					article.update({ $push: { comments: newComment } }, {}, function(err) {
                // Update local version of article to reflect change, return
                article.comments.push(newComment)
                res.send({ articles: [ article ]})
                return
            })
				} else {
					console.log('editting comment')
					var comment
					article.comments.filter(x => {
						if (x.commentId == req.body.commentId && x.author == req.user) {
							comment = x
						}
					})
					comment.text = req.body.text
					article.save()
					res.send({ articles: [ article ] })
				}
			})
		}
	}
}

module.exports = app => {
	app.post('/article', isLoggedIn, uploadImage('article'), addArticle)
	app.get('/articles/:id*?', getArticles)
	app.put('/articles/:id', isLoggedIn, putArticle)
}
