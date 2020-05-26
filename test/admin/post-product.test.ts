import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

const product = {
	brand: 'Test Marka',
	category: 1,
	name: 'Test Product',
	price: 9
}

export default () => describe('POST /admin/product', () => {
	it('correct', (done) => (
		request(app)
			.post('/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send(product)
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.name).to.be.equal('Test Product')
				process.env.testProduct = JSON.stringify(response.body)
				done()
			})
	))
})