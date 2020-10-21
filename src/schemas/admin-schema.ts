import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const categorySchema = Joi.object({
	name: Joi.string().required()
}).required()

export const saveSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	name: Joi.string().required(),
	types: Joi.array().min(0).items(Joi.string()).sparse(false).allow(null)
}).required()

export const updateSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	subCategoryId: Joi.string().required(),
	name: Joi.string().required(),
	types: Joi.array().min(0).items(Joi.string()).sparse(false).allow(null)
}).required()

export const deleteSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	_id: Joi.string().required()
}).required()

const colorSchema = Joi.object({
	name: Joi.string().required(),
	code: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/).required()
})

const productSpecificationsSchema = Joi.object({
	name: Joi.string().required(),
	slug: Joi.string().required(),
	value: Joi.string().required()
})

export const saveProductSchema = Joi.object({
	categoryId: Joi.string().required(),
	subCategoryId: Joi.string().required(),
	brand: Joi.string().required(),
	name: Joi.string().required(),
	details: Joi.string().allow(null, ''),
	type: Joi.string().required(),
	specifications: Joi.array().min(1).items(productSpecificationsSchema).sparse(false).allow(null),
	price: Joi.number().positive().required(),
	discountedPrice: Joi.number().positive().less(Joi.ref('price')).allow(null),
	imageCount: Joi.number().min(0).default(0),
	purchasable: Joi.boolean().default(true).required(),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null)
}).with('colorGroup', ['color'])
	.with('discountedPrice', ['price'])
	.required()

export const updateProductSchema = Joi.object({
	categoryId: Joi.string().allow(null),
	subCategoryId: Joi.string().allow(null),
	brand: Joi.string().allow(null),
	name: Joi.string().allow(null),
	details: Joi.string().allow(null, ''),
	type: Joi.string(),
	specifications: Joi.array().min(1).items(productSpecificationsSchema).sparse(false).allow(null),
	price: Joi.number().positive().allow(null),
	discountedPrice: Joi.number().positive().less(Joi.ref('price')).allow(null),
	imageCount: Joi.number().min(0).default(0).allow(null),
	purchasable: Joi.boolean().allow(null),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null)
}).with('discountedPrice', ['price'])
	.required()

export const saveTypeSchema = Joi.object({
	name: Joi.string().required(),
	specifications: Joi.array().min(1).items(Joi.string().required()).sparse(false).allow(null)
})

export const updateTypeSchema = Joi.object({
	name: Joi.string().required(),
	specifications: Joi.array().min(1).items(Joi.string().required()).sparse(false).allow(null)
})

export const deleteTypeSchema = Joi.object({
	_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
})