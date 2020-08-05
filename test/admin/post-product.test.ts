import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /admin/product', () => {
	it('without purchasable', (done) => ( // TODO test other required fields too
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"purchasable\" is required')
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.post('/api/admin/product')
			.set({ Authorization: process.env.adminToken })
			.send({
				categoryId: JSON.parse(process.env.testCategory)._id,
				subCategoryId: JSON.parse(process.env.testSubCategory)._id,
				purchasable: true,
				brand: 'Test Marka',
				name: 'Test Product',
				price: 9,
				type: JSON.parse(process.env.testType)._id
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