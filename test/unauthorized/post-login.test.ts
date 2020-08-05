import request from 'supertest'
import { expect } from 'chai'

import { isTextContainsAllKeys } from '../tools/index'
import app from '../../src/app'
import ErrorMessages from '../../src/errors/ErrorMessages'

export default () => describe('POST /login', () => {
	it('without phoneNumber', (done) => (
		request(app)
			.post('/api/login')
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
			.post('/api/login')
			.send({
				phoneNumber: '905555555000'
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['password', 'required'])).to.equal(true)
				done()
			})
	))

	it('wrong phoneNumber', (done) => (
		request(app)
			.post('/api/login')
			.send({
				phoneNumber: '905555555000',
				password: '1234'
			})
			.expect(401)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.USER_IS_NOT_EXISTS)
				done()
			})
	))

	it('wrong password', (done) => (
		request(app)
			.post('/api/login')
			.send({
				phoneNumber: '905555555555',
				password: '1234x'
			})
			.expect(401)
			.end((error, response) => {
				expect(response.body.error).to.equal(ErrorMessages.WRONG_PHONE_OR_PASSWORD)
				done()
			})
	))

	it('correct', (done) => (
		request(app)
			.post('/api/login')
			.send({
				phoneNumber: '905555555555',
				password: '1234'
			})
			.expect(200)
			.end((error, response) => {
				expect(response.body.user.phoneNumber).to.equal('0555 555 55 55') // regional
				expect(response.body.token).to.be.a('string')
				expect(response.body.user).to.be.a('object')

				process.env.token = response.body.token
				process.env.user = JSON.stringify(response.body.user)

				done()
			})
	))
})