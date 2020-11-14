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

export const makeOrderSchema = Joi.object({
	address: Joi.string().required(),
	card: Joi.string().required()
})

export const returnItemsSchema = Joi.array().min(1).items(
	Joi.object({
		_id: Joi.string().required(),
		quantity: Joi.number().positive().required()
	})
).sparse(false).required()
