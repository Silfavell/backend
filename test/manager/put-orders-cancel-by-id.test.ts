import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import OrderStatus from '../../src/enums/order-status-enum'

export default () => describe('PUT /orders/cancel/:_id', () => {
	it('without cancellation (message) reason', (done) => {
		request(app)
			.put(`/api/manager/orders/cancel/${JSON.parse(process.env.cancelOrder)._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(400)
			.end((error, response) => {
				expect(response.body.error)
				done()
			})
	})

	it('correct', (done) => {
		request(app)
			.put(`/api/manager/orders/cancel/${JSON.parse(process.env.cancelOrder)._id}`)
			.set({ Authorization: process.env.managerToken })
			.send({ message: '..Reason..' })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.customer).to.equal('testUser')
				expect(response.body.address).to.equal(JSON.parse(process.env.cancelOrder).address)
				expect(response.body.status).to.equal(OrderStatus.CANCELED)
				done()
			})
	})
})