import request from 'supertest'
import { expect } from 'chai'
import readline from 'readline'

import app from '../../src/app'
import { isTextContainsAllKeys } from '../tools/index'
import ErrorMessages from '../../src/errors/ErrorMessages'

let activationCode

export default () => describe('POST /register-manager', () => {
	beforeAll((done) => {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

		rl.question('Enter register manager activation code \n'.repeat(10), (answer) => {
			if (answer.substring(0, 4).length > 3) {
				activationCode = answer.substring(0, 4)
				rl.close()
				done()
			}
		})
	})

	it('inconvient phone number', (done) => (
		request(app)
			.post('/register-manager')
			.send({
				phoneNumber: '915555555555', // 91
				email: 'testUser@hotmail.com',
				nameSurname: 'testUser',
				password: '1234',
				activationCode
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['Phone', 'invalid'])).to.equal(true)
				done()
			})
	))

	it('wrong activation code', (done) => (
		request(app)
			.post('/register-manager')
			.send({
				phoneNumber: '905555555555',
				email: 'testUser@hotmail.com',
				nameSurname: 'testUser',
				password: '1234',
				activationCode: activationCode - 1
			})
			.expect(400)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.WRONG_ACTIVATION_CODE)
				done()
			})
	))

	it('without password', (done) => (
		request(app)
			.post('/register-manager')
			.send({
				phoneNumber: '905555555555',
				email: 'testUser@hotmail.com',
				nameSurname: 'testUser',
				activationCode
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['password', 'required'])).to.equal(true)
				done()
			})
	))

	it('without nameSurname', (done) => (
		request(app)
			.post('/register-manager')
			.send({
				phoneNumber: '905555555555',
				email: 'testUser@hotmail.com',
				activationCode,
				password: '1234'
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['nameSurname', 'required'])).to.equal(true)
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.post('/register-manager')
			.send({
				phoneNumber: '5555555555',
				nameSurname: 'testUser',
				email: 'testUser@hotmail.com',
				password: '1234',
				activationCode
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				done()
				//	expect(response.body.user.phoneNumber).to.equal('0555 555 55 55') // regional
				//	expect(response.body.token).to.be.a('string')
				//	expect(response.body.user).to.be.a('object')
			})
	))
})