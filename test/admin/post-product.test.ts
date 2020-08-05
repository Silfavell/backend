import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /admin/product', () => {
	it('correct', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				brand: 'Test Marka',
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				name: 'Test Product',
				price: 9
			})
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