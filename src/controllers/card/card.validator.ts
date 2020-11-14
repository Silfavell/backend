import Joi from '@hapi/joi'

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