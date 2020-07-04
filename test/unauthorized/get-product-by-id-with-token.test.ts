import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /product/:_id with token', () => {
	it('get first product firs time', (done) => {
		request(app)
			.get(`/add-product/${JSON.parse(process.env.product)._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price')
				done()
			})
	})

	it('get first product second time - should return with quantity', (done) => {
		request(app)
			.get(`/add-product/${JSON.parse(process.env.product)._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price', 'quantity')
				expect(response.body.quantity).to.equal(2)
				done()
			})
	})

	it('get second product first time - should return with quantity', (done) => {
		request(app)
			.get(`/add-product/${JSON.parse(process.env.product2)._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price')
				done()
			})
	})

	it('get second product second time - should return with quantity', (done) => {
		request(app)
			.get(`/add-product/${JSON.parse(process.env.product2)._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price', 'quantity')
				expect(response.body.quantity).to.equal(2)
				done()
			})
	})

	it('get second product third time - should return with quantity', (done) => {
		request(app)
			.get(`/add-product/${JSON.parse(process.env.product2)._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body).to.be.an('object').to.contains.all.keys('_id', 'brand', 'name', 'price', 'quantity')
				expect(response.body.quantity).to.equal(3)
				done()
			})
	})
})