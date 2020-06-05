import Joi from '@hapi/joi'

import {
	updateProfileSchema,
	productSchema,
	saveAddressSchema,
	changePasswordSchema,
	phoneSchema,
	makeOrderSchema,
	postPaymentCardSchema,
	deletePaymentCardSchema,
	favoriteProductSchema
} from '../schemas/user-schema'

// eslint-disable-next-line no-unused-vars
import { ProductDocument } from '../models'

export const validatePhoneNumber = (requestBody: any) => (
	phoneSchema.validate(requestBody)
)

export const validateProducts = (products: ProductDocument[]) => (
	Joi.array().min(1).items(productSchema).sparse(false)
		.validateAsync(products)
)

export const validateUpdateProfileRequest = (context: any) => (
	updateProfileSchema.validateAsync(context)
)

export const validateSaveCartRequest = (cart: any) => (
	validateProducts(Object.values(cart))
)

export const validateSaveAddressRequest = (context: any) => (
	saveAddressSchema.validateAsync(context)
)

export const validateFavoriteProductRequest = (context: any) => (
	favoriteProductSchema.validateAsync(context)
)

export const validateChangePasswordRequest = (context: any) => (
	changePasswordSchema.validateAsync(context)
)

export const validateMakeOrderRequest = (context: any) => (
	makeOrderSchema.validateAsync(context)
)

export const validatePostPaymentCardRequest = (card: any) => (
	postPaymentCardSchema.validateAsync(card)
)

export const validateDeletePaymentCardRequest = (card: any) => (
	deletePaymentCardSchema.validateAsync(card)
)