import Joi from '@hapi/joi'

export const confirmOrderSchema = Joi.object({
	message: Joi.string().length(12).required()
})

export const cancelOrderSchema = Joi.object({
	message: Joi.string().min(10).required()
})

export const cancelReturnSchema = Joi.object({
	message: Joi.string().min(10).required()
})

export const confirmReturnSchema = Joi.object({
	
})