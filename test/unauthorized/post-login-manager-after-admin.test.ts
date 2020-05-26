import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'

export default () => describe('POST /login-manager after verified', () => {
	it('login succesfully', (done) => (
		request(app)
			.post('/login-manager')
			.send({
				phoneNumber: '555 555 55 55',
				password: '1234'
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.manager.phoneNumber).to.equal('0555 555 55 55')
				expect(response.body.manager.password).to.not.equal('1234')
				process.env.managerToken = response.body.token
				done()
			})
	))
})