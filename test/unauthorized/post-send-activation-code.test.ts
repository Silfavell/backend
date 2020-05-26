import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import ActivationCodes from '../../src/enums/activation-code-enum'
import { isTextContainsAllKeys } from '../tools'

export default () => describe('POST /send-activation-code', () => {
	describe('POST /send-activation-code', () => {
		it('without activation code', (done) => (
			request(app)
				.post('/send-activation-code')
				.send({ phoneNumber: '905555555555' })
				.expect(400)
				.end((error, response) => {
					expect(isTextContainsAllKeys(response.body.error, ['activationCode', 'required'])).to.equal(true)
					done()
				})
		))

		it('unkown activation code type', (done) => (
			request(app)
				.post('/send-activation-code')
				.send({
					phoneNumber: '905555555555',
					activationCodeType: 5
				})
				.expect(400)
				.end((error, response) => {
					expect(isTextContainsAllKeys(response.body.error, ['activationCodeType', 'less'])).to.equal(true)
					done()
				})
		))

		it('inconvenient phone number', (done) => (
			request(app)
				.post('/send-activation-code')
				.send({ phoneNumber: '915555555555' })
				.expect(400)
				.end((error, response) => {
					expect(isTextContainsAllKeys(response.body.error, ['Phone', 'invalid'])).to.equal(true)
					done()
				})
		))

		it('without body', () => (
			request(app)
				.post('/send-activation-code')
				.expect(400)
		))

		it('correct', () => (
			request(app)
				.post('/send-activation-code')
				.send({
					phoneNumber: '905555555555',
					activationCodeType: ActivationCodes.REGISTER_USER
				})
				.expect(202)
		))
	})
})