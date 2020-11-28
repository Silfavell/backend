import Joi from '@hapi/joi'

export const saveTypeSchema = Joi.object({
	name: Joi.string().required(),
	specifications: Joi.array().min(1).items(Joi.string().required()).sparse(false)
		.allow(null)
})

export const updateTypeSchema = Joi.object({
	name: Joi.string().required(),
	specifications: Joi.array().min(1).items(Joi.string().required()).sparse(false)
		.allow(null)
})

export const deleteTypeSchema = Joi.object({
	_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
})