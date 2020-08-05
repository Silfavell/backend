import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('DELETE /user/payment-card', () => {
	it('correct', (done) => (
		request(app)
			.put('/api/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				cardToken: process.env.cardTokenToDelete
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}
				expect(response.body.status).to.equal('success')
				done()
			})
	))
})