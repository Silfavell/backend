import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /products-with-categories', () => {
	it('correct', (done) => {
		request(app)
			.get('/api/products-with-categories')
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('array')
				process.env.product = JSON.stringify(response.body[0].subCategories[0].products[0])
				process.env.product2 = JSON.stringify(response.body[0].subCategories[0].products[1])
				done()
			})
	})
})