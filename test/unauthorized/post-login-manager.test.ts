import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'

export default () => describe('POST /login-manager', () => {
	it('try to login not verified manager account', (done) => {
		request(app)
			.post('/api/login-manager')
			.send({
				phoneNumber: '555 555 55 55',
				password: '1234'
			})
			.expect(401)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.MANAGER_IS_NOT_VERIFIED)
				done()
			})
	})
})