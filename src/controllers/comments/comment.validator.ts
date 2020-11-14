import Joi from '@hapi/joi'

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
