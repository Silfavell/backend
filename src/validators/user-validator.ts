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
	favoriteProductSchema,
	returnItemsSchema
} from '../schemas/user-schema'

import { ProductDocument } from '../models'

export const validatePhoneNumber = (body: any) => phoneSchema.validate(body)

export const validateProducts = (products: ProductDocument[]) => Joi.array().min(1).items(productSchema).sparse(false).validateAsync(products)

export const validateUpdateProfileRequest = (body: any) => updateProfileSchema.validateAsync(body)

export const validateSaveCartRequest = (cart: any) => validateProducts(cart)

export const validateSaveAddressRequest = (body: any) => saveAddressSchema.validateAsync(body)

export const validateFavoriteProductRequest = (body: any) => favoriteProductSchema.validateAsync(body)

export const validateChangePasswordRequest = (body: any) => changePasswordSchema.validateAsync(body)

export const validateMakeOrderRequest = (body: any) => makeOrderSchema.validateAsync(body)

export const validatePostPaymentCardRequest = (card: any) => postPaymentCardSchema.validateAsync(card)

export const validateDeletePaymentCardRequest = (card: any) => deletePaymentCardSchema.validateAsync(card)

export const validatePostReturnItems = (returnItems: any[]) => returnItemsSchema.validateAsync(returnItems)