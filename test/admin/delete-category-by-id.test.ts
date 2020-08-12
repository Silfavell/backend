import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { CategoryDocument } from '../../src/models'

export default () => describe('DELETE /admin/category/:_id', () => {
	it('correct', (done) => (
		request(app)
			.delete(`/api/admin/category/${JSON.parse(process.env.testCategory)._id}`)
			.set({ Authorization: process.env.adminToken })
			.send({
				name: 'testCategoryUpdated'
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.name).to.equal('testCategoryUpdated')
				done()
			})
	))

	it('should categories not contain testCategoryUpdated', (done) => (
		request(app)
			.get('/api/categories')
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body).some(((category: CategoryDocument) => category.name === 'testCategoryUpdated'))).to.equal(false)
				done()
			})
	))
})