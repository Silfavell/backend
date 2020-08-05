import jwt from 'jsonwebtoken'

import unauhorized from './unauthorized/index.test'
import user from './user/index.test'
import manager from './manager/index.test'
import admin from './admin/index.test'

import {
	User,
	Manager,
	Admin,
	Category,
	Order,
	Product
} from '../src/models'
import ActivationCode from '../src/models/ActivationCode'

describe('sequentially run tests', () => {
	beforeAll((done) => {
		new Admin({
			phoneNumber: '555 555 55 55',
			nameSurname: 'test admin',
			email: 'test@test.com',
			password: '1234'
		}).save().then((adminObj) => {
			jwt.sign({ payload: adminObj }, process.env.SECRET, (jwtErr: Error, createdToken: any) => {
				if (jwtErr) {
					done(jwtErr.message)
				}
				process.env.adminToken = createdToken
				done()
			})
		})
	})

	unauhorized()
	admin()
	user()
	manager()

	afterAll((done) => {
		Promise.all([
			Product.deleteOne({ name: 'Test Product' }),
			Product.deleteOne({ name: 'Test Product 2' }),
			User.deleteOne({ phoneNumber: '0555 555 55 55' }),
			Manager.deleteOne({ phoneNumber: '0555 555 55 55' }),
			Admin.deleteOne({ phoneNumber: '555 555 55 55' }),
			Category.deleteOne({ name: 'testCategory' }),
			Category.deleteOne({ name: 'testCategoryUpdated' }),
			Order.deleteMany({ customer: 'testUser' }),
			ActivationCode.deleteMany({ userPhoneNumber: '0555 555 55 55' }),
		]).then(() => {
			done()
		})
	})
})