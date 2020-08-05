import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../../src/models'

export default () => describe('GET /user/cart', () => {
	it('correct', (done) => (
		request(app)
			.get('/api/user/cart')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				const cartProductIds = [
					JSON.parse(process.env.product)._id,
					JSON.parse(process.env.product2)._id
				]

				expect(Object.values(response.body)).to.be.an('array')
				expect(
					Object.values(response.body.cart).every((product: ProductDocument) => (
						cartProductIds.includes(product._id)
					))
				).to.equal(true)
				done()
			})
	))
})