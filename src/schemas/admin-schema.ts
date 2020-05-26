import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
}).required()

export const saveProductSchema = Joi.object({
	category: Joi.string().required(),
	brand: Joi.string().required(),
	name: Joi.string().required(),
	price: Joi.number().required()
}).required()

export const updateProductSchema = Joi.object({
	image: Joi.number().allow(null),
	category: Joi.string().allow(null),
	brand: Joi.string().allow(null),
	name: Joi.string().allow(null),
	price: Joi.number().allow(null)
}).required()