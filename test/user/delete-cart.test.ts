import request from 'supertest'

import app from '../../src/app'

export default () => describe('DELETE /user/cart', () => {
	it('correct', () => (
		request(app)
			.delete('/user/cart')
			.set({ Authorization: process.env.token })
			.expect(200)
	))
})