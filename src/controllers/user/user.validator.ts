import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const updateProfileSchema = Joi.object({
	// phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }),
	email: Joi.string().email(),
	nameSurname: Joi.string().required()
})

export const saveAddressSchema = Joi.object({
	openAddress: Joi.string().required(),
	addressTitle: Joi.string().required()
})

export const changePasswordSchema = Joi.object({
	oldPassword: Joi.string().min(4).required(),
	newPassword: Joi.string().min(4).required()
})

export const updatePhoneNumberSchema = Joi.object({
	newPhoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})