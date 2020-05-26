import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

const cartProductIds = [
	'5ea7ac324756fd1988870999',
	'5ea7ac324756fd198887099b'
]

export default () => describe('GET /cart before post cart', () => {
	it('correct', (done) => (
		request(app)
			.get('/user/cart')
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body)).to.be.an('array')
				expect(
					Object.values(response.body).every((product: any) => (
						cartProductIds.includes(product._id) || product.quantity === 2
					))
				).to.equal(true)
				done()
			})
	))
})