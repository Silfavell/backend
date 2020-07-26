import JoiBase from '@hapi/joi'
// @ts-ignore
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
	addressTitle: Joi.string().required(),
	buildingNo: Joi.string().allow(null, ''),
	floor: Joi.string().allow(null, ''),
	aptNo: Joi.string().allow(null, ''),
	directions: Joi.string().allow(null, ''),
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