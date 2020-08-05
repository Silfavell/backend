import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /cart before post cart', () => {
	it('correct', (done) => (
		request(app)
			.get('/api/user/cart')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object')
				expect(response.body.cart).to.be.an('object')

				const productIds = [
					JSON.parse(process.env.product)._id,
					JSON.parse(process.env.product2)._id
				]

				expect(
					Object.values(response.body.cart).every((product: any) => (
						productIds.includes(product._id) && product.quantity === 2
					))
				).to.equal(true)
				done()
			})
	))
})