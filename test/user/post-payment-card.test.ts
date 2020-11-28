import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import { isTextContainsAllKeys } from '../tools/index'

export default () => describe('POST /user/payment-card', () => {
	it('with 15 character card', (done) => (
		request(app)
			.post('/api/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				card: {
					cardAlias: 'deneme cart',
					cardHolderName: 'Muhammet İpek',
					cardNumber: '374427000000003',
					expireMonth: '12',
					expireYear: '2030'
				}
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['cardNumber', 'length', '16'])).to.equal(true)
				done()
			})
	))

	it('wrong expire year', (done) => (
		request(app)
			.post('/api/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				card: {
					cardAlias: 'deneme cart',
					cardHolderName: 'Muhammet İpek',
					cardNumber: '5311570000000005',
					expireMonth: '12',
					expireYear: '23'
				}
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['expireYear', 'length', '4'])).to.equal(true)
				done()
			})
	))

	it('wrong expire month', (done) => (
		request(app)
			.post('/api/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				card: {
					cardAlias: 'deneme cart',
					cardHolderName: 'Muhammet İpek',
					cardNumber: '5311570000000005',
					expireMonth: '9',
					expireYear: '2023'
				}
			})
			.expect(400)
			.end((error, response) => {
				expect(isTextContainsAllKeys(response.body.error, ['expireMonth', 'length', '2'])).to.equal(true)
				done()
			})
	))

	it('save card to use later', (done) => (
		request(app)
			.post('/api/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				card: {
					cardAlias: 'deneme cart',
					cardHolderName: 'Muhammet İpek',
					cardNumber: '5311570000000005',
					expireMonth: '12',
					expireYear: '2030'
				}
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.status).to.equal('success')
				expect(response.body.lastFourDigits).to.equal('0005')
				process.env.cardToken = response.body.cardToken
				done()
			})
	))

	it('save card to delete', (done) => (
		request(app)
			.post('/api/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				card: {
					cardAlias: 'deneme cart',
					cardHolderName: 'Muhammet İpek',
					cardNumber: '4987490000000002',
					expireMonth: '12',
					expireYear: '2030'
				}
			})
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.status).to.equal('success')
				expect(response.body.lastFourDigits).to.equal('0002')
				process.env.cardTokenToDelete = response.body.cardToken
				done()
			})
	))
})