import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../../src/models'

const cartProductIds = [// TODO serverda buradaki değerler değiştirilecek
	'5ea7ac324756fd198887099a',
	'5ea7ac324756fd1988870999',
	'5ea7ac324756fd198887099b'
]

export default () => describe('GET /user/cart', () => {
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
					Object.values(response.body).every((product: ProductDocument) => (
						cartProductIds.includes(product._id)
					))
				).to.equal(true)
				done()
			})
	))
})