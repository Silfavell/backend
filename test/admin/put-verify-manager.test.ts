import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('PUT /verify-manager/:_id', () => {
	it('correct', (done) => {
		request(app)
			.put(`/api/admin/verify-manager/${JSON.parse(process.env.manager)._id}`)
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body._id).to.equal(JSON.parse(process.env.manager)._id)
				expect(JSON.parse(process.env.manager).verified).to.equal(false)
				expect(response.body.verified).to.equal(true)
				done()
			})
	})
})