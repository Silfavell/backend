import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'
import { isTextContainsAllKeys } from '../tools'

export default () => describe('POST /user/order', () => {
	it('without address', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				card: process.env.cardToken
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['address', 'required'])).to.equal(true)
				done()
			})
	))

	it('without card', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id
			})
			.expect(400)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(isTextContainsAllKeys(response.body.error, ['card', 'required'])).to.equal(true)
				done()
			})
	))

	it('with manually created cart (Products added to cart one by one in unauthorized get product by id with token)', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: process.env.cardToken
			})
			.expect(200)
	))

	it('with empty cart', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: process.env.cardToken
			})
			.expect(400)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.EMPTY_CART)
				done()
			})
	))

	it('POST /cart to make succesfully order', () => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send([
				{
					_id: JSON.parse(process.env.product)._id,
					quantity: 3
				},
				{
					_id: JSON.parse(process.env.product2)._id,
					quantity: 5
				}
			])
			.expect(200)
	))

	it('with unknown address', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: '12345',
				card: process.env.cardToken
			})
			.expect(400)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.NO_ADDRESS)
				done()
			})
	))

	it('make order 1', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: process.env.cardToken
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				process.env.cancelOrder = JSON.stringify(response.body.order)
				done()
			})
	))

	it('POST /cart to make succesfully order 2', () => (
		request(app)
			.post('/user/cart')
			.set({ Authorization: process.env.token })
			.send([
				{
					_id: JSON.parse(process.env.product)._id,
					quantity: 3
				},
				{
					_id: JSON.parse(process.env.product2)._id,
					quantity: 5
				}
			])
			.expect(200)
	))

	it('make order 2', (done) => (
		request(app)
			.post('/user/order')
			.set({ Authorization: process.env.token })
			.send({
				address: JSON.parse(process.env.user).addresses[0]._id,
				card: process.env.cardToken
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				//	expect(response.body.customer).to.equal('testUser')
				//	expect(response.body.address).to.equal(JSON.parse(process.env.user).addresses[0].openAddress)
				//	expect(response.body.status).to.equal(null)
				process.env.confirmOrder = JSON.stringify(response.body.order)
				done()
			})
	))
})