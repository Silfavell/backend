import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
// eslint-disable-next-line no-unused-vars
import { CategoryDocument } from '../../src/models'

export default () => describe('POST /admin/category', () => {
	it('correct', (done) => (
		request(app)
			.post('/admin/category')
			.set({ Authorization: process.env.adminToken })
			.send({
				name: 'testCategory'
			})
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body.name).to.equal('testCategory')
				process.env.testCategory = JSON.stringify(response.body)
				done()
			})
	))

	it('should categories contain testCategory', (done) => (
		request(app)
			.get('/categories')
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body).some(((category: CategoryDocument) => category.name === 'testCategory'))).to.equal(true)
				done()
			})
	))
})