import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const phoneSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true })
})

export const productSchema = Joi.object({
	_id: Joi.string().required(),
	quantity: Joi.number().min(1).required()
})

export const updateProfileSchema = Joi.object({
	// phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }),
	email: Joi.string().email(),
	nameSurname: Joi.string().required()
})

export const saveAddressSchema = Joi.object({
	openAddress: Joi.string().required(),
	addressTitle: Joi.string().required()
})

export const favoriteProductSchema = Joi.object({
	_id: Joi.string().required()
})

export const changePasswordSchema = Joi.object({
	oldPassword: Joi.string().min(4).required(),
	newPassword: Joi.string().min(4).required()
})

export const makeOrderSchema = Joi.object({
	address: Joi.string().required(),
	card: Joi.string().required()
})

export const postPaymentCardSchema = Joi.object({
	cardAlias: Joi.string().required(),
	cardHolderName: Joi.string().required(),
	cardNumber: Joi.string().min(16).max(16).creditCard()
		.required(),
	expireYear: Joi.string().min(4).max(4).required(), // TODO
	expireMonth: Joi.string().min(2).max(2).required(), // TODO
})

export const deletePaymentCardSchema = Joi.object({
	cardToken: Joi.string().required()
})

export const saveCommentSchema = Joi.object({
	productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	title: Joi.string().required(),
	comment: Joi.string().min(30).required(),
	generalRate: Joi.number().min(1).max(5).required(),
	qualityRate: Joi.number().min(1).max(5).required(),
	priceRate: Joi.number().min(1).max(5).required(),
	ownerAlias: Joi.string().allow(null, '')
})

export const likeSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()