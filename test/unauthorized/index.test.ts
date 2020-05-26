import request from 'supertest'

import app from '../../src/app'
import ActivationCodes from '../../src/enums/activation-code-enum'

import postSendActivationCodeTests from './post-send-activation-code.test'
import postRegisterTests from './post-register.test'
import postLoginTests from './post-login.test'
import putResetPasswordTests from './put-reset-password.test'
import postRegisterManagerTests from './post-register-manager.test'
import postLoginManagerTests from './post-login-manager.test'

import getProductsTests from './get-products.test'
import getCategoriesTests from './get-categories.test'
import getProductByIdTests from './get-product-by-id.test'
import getProductByIdWithTokenTests from './get-product-by-id-with-token.test'
import deleteProductByIdTests from './delete-product-by-id.test'

export default () => describe('Unauthorized', () => {
	postSendActivationCodeTests()
	postRegisterTests()
	postLoginTests()

	describe('divider', () => {
		it('Send code activation code for reset password', () => (
			request(app)
				.post('/send-activation-code')
				.send({
					phoneNumber: '905555555555',
					activationCodeType: ActivationCodes.RESET_PASSWORD
				})
				.expect(202)
		))
	})

	putResetPasswordTests()

	describe('divider', () => {
		it('Send code activation code for register manager', () => (
			request(app)
				.post('/send-activation-code')
				.send({
					phoneNumber: '905555555555',
					activationCodeType: ActivationCodes.REGISTER_MANAGER
				})
				.expect(202)
		))
	})

	postRegisterManagerTests()

	getProductsTests()
	getCategoriesTests()
	getProductByIdTests()
	deleteProductByIdTests()
	getProductByIdWithTokenTests()
	deleteProductByIdTests()
	postLoginManagerTests()
})