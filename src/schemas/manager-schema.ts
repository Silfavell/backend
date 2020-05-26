import Joi from '@hapi/joi'

export const confirmOrderSchema = Joi.object({
	trackingNumber: Joi.string().required()
})

export const cancelOrderSchema = Joi.object({
	cancellationReason: Joi.string().required()
})