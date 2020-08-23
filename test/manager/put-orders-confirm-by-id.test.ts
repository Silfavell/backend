import request from 'supertest'
import { expect } from 'chai'

import app from '../../src/app'
import OrderStatus from '../../src/enums/order-status-enum'

export default () => describe('PUT /orders/confirm/:_id', () => {
	it('without tracking number', (done) => {
		request(app)
			.put(`/api/manager/orders/confirm/${JSON.parse(process.env.confirmOrder)._id}`)
			.set({ Authorization: process.env.managerToken })
			.expect(400)
			.end((error, response) => {
				expect(response.body.error)
				done()
			})
	})

	it('correct', (done) => {
		request(app)
			.put(`/api/manager/orders/confirm/${JSON.parse(process.env.confirmOrder)._id}`)
			.set({ Authorization: process.env.managerToken })
			.send({ message: '123456789012' })
			.expect(200)
			.end((error, response) => {
				if (response.body.error) {
					done(response.body.error)
				}

				expect(response.body.customer).to.equal('testUser')
				expect(response.body.address).to.equal(JSON.parse(process.env.confirmOrder).address)
				expect(response.body.status).to.equal(OrderStatus.APPROVED)
				done()
			})
	})
})