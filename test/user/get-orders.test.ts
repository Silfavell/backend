import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /user/orders', () => {
	it('correct', (done) => (
		request(app)
			.get('/api/user/orders')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('array')
				done()
			})
	))
})