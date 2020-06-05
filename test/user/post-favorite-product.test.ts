import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /user/favorite-product', () => {
	it('with no body', () => (
		request(app)
			.post('/user/favorite-product')
			.set({ Authorization: process.env.token })
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.post('/user/favorite-product')
			.set({ Authorization: process.env.token })
			.send({
				productId: JSON.parse(process.env.product)._id
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.favoriteProducts.includes(JSON.parse(process.env.product)._id)).to.equal(true)
				done()
			})
	))

	it('duplicate favorite product (should\'nt contain id 2 times)', (done) => (
		request(app)
			.post('/user/favorite-product')
			.set({ Authorization: process.env.token })
			.send({
				productId: JSON.parse(process.env.product)._id
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.favoriteProducts.filter((favoriteProduct) => favoriteProduct === JSON.parse(process.env.product)._id).length).to.equal(1)
				done()
			})
	))
})