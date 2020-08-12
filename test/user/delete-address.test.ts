import request from 'supertest'
import { expect } from 'chai'

import {
		AddressDocument
} from '../../src/models'
import app from '../../src/app'

export default () => describe('DELETE /user/address', () => {
	it('correct', (done) => (
		request(app)
			.delete(`/api/user/address/${JSON.parse(process.env.user).addresses[0]._id}`)
			.set({ Authorization: process.env.token })
			.expect(200)
			.end((error, response) => {
				if (error) {
					done(error)
				}
				expect(response.body).to.contains.all.keys('_id')
				expect(response.body.addresses.some((address: AddressDocument) => (
					address._id === JSON.parse(process.env.user).addresses[0]._id
				))).to.equal(false)
				done()
			})
	))
})