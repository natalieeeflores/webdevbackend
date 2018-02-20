/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate Article functionality', () => {

	it('should give me ten or more articles', (done) => {
		// IMPLEMENT ME
		fetch(url('/articles'))
		.then(res => {
      expect(res.status).to.eql(200)
			return res.text()
		})
		.then(body => {
			expect(body.length).to.be.at.least(10)
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should add two articles with successive article ids, and return the article each time', (done) => {
		// add a new article
		// verify you get the article back with an id
		// verify the content of the article
		// add a second article
		// verify the article id increases by one
		// verify the second artice has the correct content
		fetch(url('/article'), {
      method: "POST",
      headers: { 'Content-Type': 'application/json'},
      body:  JSON.stringify({ text: "test article #1"})
    })
		.then(res => {
			expect(res.status).to.eql(200)
			return res.text()
		})
		.then(body => {
      console.log(body)
      const articles = JSON.parse(body).articles
      expect(articles[articles.length - 1].text).to.eql("test article #1")
		})
    .then(body => {
      fetch(url('/article'), {
        method: "POST",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ text: "test article #2"})
      })
      .then(res => {
        expect(res.status).to.eql(200)
        return res.text()
      })
      .then(body => {
        const articles = JSON.parse(body).articles
        expect(articles[articles.length - 1].text).to.eql("test article #2")
      })
    })
    .then(done)
    .catch(done)
 	}, 200)

	it('should return an article with a specified id', (done) => {
		// call GET /articles first to find an id, perhaps one at random
		// then call GET /articles/id with the chosen id
		// validate that only one article is returned
    var id
		fetch(url('/articles'))
    .then(res => {
      expect(res.status).to.eql(200)
      return res.text()
    })
    .then(body => {
      id = JSON.parse(body).articles[0].id
      console.log(typeof id)
    })
    .then(body => {
      fetch(url('/articles', id))
      .then(res => {
        expect(res.status).to.eql(200)
        return res.text()
      })
      .then(body => {
        expect(JSON.parse(body).articles[0].id).to.eql(id)
      })
    })
    .then(done)
    .catch(done)
	}, 200)

	// it('should return nothing for an invalid id', (done) => {
	// 	// call GET /articles/id where id is not a valid article id, perhaps 0
	// 	// confirm that you get no results
	// 	fetch(url('/articles/1000000'))
  //   .then(res => {
  //     expect(res.status).to.eql(200)
  //     return res.text()
  //   })
  //   .then(body => {
  //     expect(JSON.parse(body)).to.eql("invalid id")
  //   })
  //   .then(done)
  //   .catch(done)
	// }, 200)

});
