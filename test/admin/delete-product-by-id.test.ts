import request from 'supertest'

import app from '../../src/app'

export default () => describe('DELETE /admin/product/:_id', () => {
	it('correct', (done) => (
		request(app)
			.delete(`/admin/product/${JSON.parse(process.env.testProduct)._id}`)
			.set({ Authorization: process.env.adminToken })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}
				done()
			})
	))
})