import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const productsFilterWithCategoriesSchema = Joi.object({
	categoryId: Joi.string().length(24).required(),
	brands: Joi.string().allow('', null),
	sortType: Joi.string().allow('', null)
})

export const sendActivationCodeSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	activationCodeType: Joi.number().min(0).max(3).required()
})

export const registerSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	nameSurname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})

export const registerManagerSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	nameSurname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})

export const loginSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	password: Joi.string().min(4).required()
})

export const resetPasswordSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	newPassword: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})

export const setProductSchema = Joi.object({
	quantity: Joi.number().min(0).required()
})

export const postTicketSchema = Joi.object({
	name: Joi.string(),
	surname: Joi.string(),
	email: Joi.string(),
	subject: Joi.string(),
	message: Joi.string().required()
})

export const putDeductProductSchema = Joi.object({
	quantity: Joi.number().min(1).required()
})