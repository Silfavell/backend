import request from 'supertest'
import { expect } from 'chai'

import { isTextContainsAllKeys } from '../tools/index'

import app from '../../src/app'

export default () => describe('PUT /deduct-product/:_id', () => {
	it('without quantity', (done) => {
		request(app)
			.put(`/api/deduct-product/${JSON.parse(process.env.product)._id}`)
			.expect(200)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['quantity', 'required'])).to.equal(true)
				done()
			})
	})

	it('with 0 quantity', (done) => {
		request(app)
			.put(`/api/deduct-product/${JSON.parse(process.env.product)._id}`)
			.expect(200)
			.send({
				quantity: 0
			})
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['quantity', 'larger', 'equal'])).to.equal(true)
				done()
			})
	})

	it('correct', (done) => {
		request(app)
			.put(`/api/deduct-product/${JSON.parse(process.env.product)._id}`)
			.send({
				quantity: 1
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price')
				done()
			})
	})
})