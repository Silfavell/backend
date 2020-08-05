import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /product/:slug', () => {
	it('correct', (done) => {
		request(app)
			.get(`/api/product/${JSON.parse(process.env.product).slug}`)
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price')
				done()
			})
	})
})