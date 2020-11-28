import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
}).required()

export const saveSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	name: Joi.string().required(),
	types: Joi.array().min(0).items(Joi.string()).sparse(false)
		.allow(null)
}).required()

export const updateSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	name: Joi.string().required(),
	types: Joi.array().min(0).items(Joi.string()).sparse(false)
		.allow(null)
}).required()

export const deleteSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
}).required()
