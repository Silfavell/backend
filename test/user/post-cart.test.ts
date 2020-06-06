import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'

const unknownProduct = {
	_id: '12345',
	quantity: 2
}

export default () => describe('POST /user/cart', () => {
	it('with unknown product', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send([
				{
					_id: JSON.parse(process.env.product)._id,
					quantity: 6
				},
				{
					_id: JSON.parse(process.env.product2)._id,
					quantity: 4
				},
				unknownProduct
			])
			.expect(400)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.UNKNOWN_OBJECT_ID)
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send([
				{
					_id: JSON.parse(process.env.product)._id,
					quantity: 6
				},
				{
					_id: JSON.parse(process.env.product2)._id,
					quantity: 4
				}
			])
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body.cart).length).to.equal(2)
				// @ts-ignore
				// eslint-disable-next-line security/detect-object-injection
				expect([
					{
						_id: JSON.parse(process.env.product)._id,
						quantity: 6
					},
					{
						_id: JSON.parse(process.env.product2)._id,
						quantity: 4
					}
					// @ts-ignore
					// eslint-disable-next-line security/detect-object-injection
				].every((product, index) => product._id === Object.values(response.body.cart)[index]._id)).to.equal(true)
				done()
			})
	))
})