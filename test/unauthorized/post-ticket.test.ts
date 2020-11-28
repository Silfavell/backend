import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /ticket', () => {
	it('without message', (done) => (
		request(app)
			.post('/api/ticket')
			.expect(400)
			.end((error, response) => {
				expect(response.body.error).to.be.equal('\"message\" is required')
				done()
			})
	))

	it('correct', () => (
		request(app)
			.post('/api/ticket')
			.send({
				name: 'name',
				surname: 'surname',
				email: 'email',
				subject: 'subject',
				message: 'message'
			})
			.expect(200)
	))
})