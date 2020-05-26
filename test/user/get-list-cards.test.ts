import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /user/list-cards', () => {
	it('correct', (done) => (
		request(app)
			.get('/user/list-cards')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}
				expect(response.body.status).to.equal('success')
				expect(response.body.cardDetails).to.be.an('array')
				expect(response.body.cardDetails.some((card) => card.cardToken === process.env.cardTokenToDelete)).to.equal(false)
				// process.env.cards = JSON.stringify(response.body.cardDetails)
				done()
			})
	))
})