import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /admin/product/:_id', () => {
	it('correct', (done) => (
		request(app)
			.put(`/api/admin/product/${JSON.parse(process.env.testProduct)._id}`)
			.set({ Authorization: process.env.adminToken })
			.send({
				brand: 'Test Marka 2'
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.brand).to.equal('Test Marka 2')
				done()
			})
	))
})