import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'

const cart = [// TODO serverda buradaki değerler değiştirilecek
	{
		_id: '5ea7ac324756fd198887099a',
		quantity: 2
	},
	{
		_id: '5ea7ac324756fd1988870999',
		quantity: 2
	},
	{
		_id: '5ea7ac324756fd198887099b',
		quantity: 2
	}
]

const unknownProduct = {
	_id: '12345',
	quantity: 2
}

export default () => describe('POST /user/cart', () => {
	it('with unknown product', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send([...cart, unknownProduct])
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.NON_EXISTS_PRODUCT)
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send(cart)
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body).length).to.equal(cart.length)
				// @ts-ignore
				// eslint-disable-next-line security/detect-object-injection
				expect(cart.every((product, index) => product._id === Object.values(response.body)[index]._id)).to.equal(true)
				done()
			})
	))
})