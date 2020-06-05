import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /user/favorite-products', () => {
	it('correct', (done) => (
		request(app)
			.get('/user/favorite-products')
			.set({ Authorization: process.env.token })
			.send({
				productId: JSON.parse(process.env.product)._id
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.favoriteProducts.map((favoriteProduct) => favoriteProduct._id).includes(JSON.parse(process.env.product)._id)).to.equal(true)
				done()
			})
	))
})