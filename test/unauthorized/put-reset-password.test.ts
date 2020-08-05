import request from 'supertest'
import { expect } from 'chai'
import readline from 'readline'

import app from '../../src/app'
import { isTextContainsAllKeys } from '../tools'
import ErrorMessages from '../../src/errors/ErrorMessages'

let resetActivationCode

export default () => describe('PUT /reset-password', () => {
	beforeAll((done) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

		rl.question('Enter reset activation code \n'.repeat(10), (answer) => {
			if (answer.substring(0, 4).length > 3) {
				// eslint-disable-next-line radix
				resetActivationCode = answer.substring(0, 4)
				rl.close()
				done()
			}
		})
	})

	it('without phoneNumber', (done) => (
		request(app)
			.put('/api/reset-password')
			.send({
				password: '1234'
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['phoneNumber', 'required'])).to.equal(true)
				done()
			})
	))

	it('without password', (done) => (
		request(app)
			.put('/api/reset-password')
			.send({
				phoneNumber: '905555555555'
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['newPassword', 'required'])).to.equal(true)
				done()
			})
	))

	it('wrong phoneNumber', (done) => (
		request(app)
			.put('/api/reset-password')
			.send({
				phoneNumber: '905555555000',
				newPassword: '1234',
				activationCode: resetActivationCode
			})
			.expect(401)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.USER_IS_NOT_EXISTS)
				done()
			})
	))

	it('correct', () => (
		request(app)
			.put('/api/reset-password')
			.send({
				phoneNumber: '905555555555',
				newPassword: '12345',
				activationCode: resetActivationCode
			})
			.expect(200)
	))
})