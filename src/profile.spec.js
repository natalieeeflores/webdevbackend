/*
 * Test suite for profile.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

describe('Validate Article functionality', () => {

	it('should update headline', (done) => {
		// IMPLEMENT ME
		fetch(url('/headline'), {
      method: "PUT",
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ headline: "hello world"})
    })
		.then(res => {
      expect(res.status).to.eql(200)
			return res.text()
		})
		.then(body => {
			expect(JSON.parse(body).headline).to.eql("hello world")
		})
		.then(done)
		.catch(done)
 	}, 200)

});
