import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /deduct-product/:_id with token', () => {
	it('correct', (done) => {
		request(app)
			.put(`/api/deduct-product/${JSON.parse(process.env.product2)._id}`)
			.send({
				quantity: 1
			})
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				// expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price', 'quantity')
				expect(response.body.quantity).to.equal(2)
				done()
			})
	})
})