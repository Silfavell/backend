import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
}).required()

export const saveSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	name: Joi.string().required(),
	types: Joi.array().min(0).items(Joi.string()).sparse(false)
		.allow(null)
}).required()

export const updateSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	subCategoryId: Joi.string().required(),
	name: Joi.string().required(),
	types: Joi.array().min(0).items(Joi.string()).sparse(false)
		.allow(null)
}).required()

export const deleteSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	_id: Joi.string().required()
}).required()
