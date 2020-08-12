import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { ManagerDocument } from '../../src/models'

export default () => describe('GET /admin/manager-requests', () => {
	it('correct', (done) => {
		request(app)
			.get('/api/admin/manager-requests')
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(Object.values(response.body)).to.be.an('array')
				const testManager = Object.values(response.body).find((manager: ManagerDocument) => manager.nameSurname === 'testUser')
				expect(testManager).to.contains.all.keys(
					'__v',
					'_id',
					'phoneNumber',
					'nameSurname',
					'email',
					'password',
					'verified'
				)
				process.env.manager = JSON.stringify(testManager)
				done()
			})
	})
})