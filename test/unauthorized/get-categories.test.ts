import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /categories', () => {
	it('correct', (done) => {
		request(app)
			.get('/categories')
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body)).to.be.an('array')
				done()
			})
	})
})