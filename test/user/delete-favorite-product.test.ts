import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('DELETE /user/favorite-product', () => {
	it('without id', () => (
		request(app)
			.post('/user/favorite-product')
			.set({ Authorization: process.env.token })
			.expect(400)
	))

	it('correct', (done) => (
		request(app)
			.delete(`/user/favorite-product/${JSON.parse(process.env.product)._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.favoriteProducts.includes(JSON.parse(process.env.product)._id)).to.equal(false)
				done()
			})
	))
})