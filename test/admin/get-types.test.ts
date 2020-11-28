import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('GET /admin/types', () => {
	it('correct', (done) => (
		request(app)
			.get('/api/admin/types')
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}
				expect(response.body).to.be.an('array')

				process.env.testType = JSON.stringify(response.body[0])

				done()
			})
	))
})