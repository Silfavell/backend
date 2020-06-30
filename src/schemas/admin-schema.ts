import JoiBase from '@hapi/joi'
// @ts-ignore
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
}).required()

export const saveSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	name: Joi.string().required()
}).required()

export const deleteSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	_id: Joi.string().required()
}).required()

const colorSchema = Joi.object({
	name: Joi.string().required(),
	code: Joi.string().required() // TODO VALIDATE COLOR CODE
})

export const saveProductSchema = Joi.object({
	categoryId: Joi.string().required(),
	subCategoryId: Joi.string().required(),
	brand: Joi.string().required(),
	name: Joi.string().required(),
	price: Joi.number().required(),
	imageCount: Joi.number().default(0).allow(null),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null) // TODO VALIDATE COLOR CODE
}).required()

export const updateProductSchema = Joi.object({
	image: Joi.number().allow(null),
	category: Joi.string().allow(null),
	brand: Joi.string().allow(null),
	name: Joi.string().allow(null),
	price: Joi.number().allow(null),
	imageCount: Joi.number().default(0).allow(null),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null) // TODO VALIDATE COLOR CODE
}).required()