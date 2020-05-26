import request from 'supertest'

import app from '../../src/app'

export default () => describe('DELETE /user/payment-card', () => {
	it('correct', () => (
		request(app)
			.delete('/user/payment-card')
			.set({ Authorization: process.env.token })
			.send({
				cardToken: JSON.parse(process.env.cards)[0].cardToken
			})
			.expect(200)
	))
})