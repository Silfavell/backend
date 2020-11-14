import Joi from '@hapi/joi'

export const postTicketSchema = Joi.object({
	name: Joi.string(),
	surname: Joi.string(),
	email: Joi.string(),
	subject: Joi.string(),
	message: Joi.string().required()
})