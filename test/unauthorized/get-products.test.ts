import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /products', () => {
	it('correct', (done) => {
		request(app)
			.get('/products')
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body)).to.be.an('array')
				process.env.product = JSON.stringify(Object.values(response.body)[0][0])
				done()
			})
	})
})