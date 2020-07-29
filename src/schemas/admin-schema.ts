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

export const updateSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	subCategoryId: Joi.string().required(),
	name: Joi.string().required(),
	types: Joi.array().min(1).items(Joi.string()).sparse(false)
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
	price: Joi.number().min(0).required(),
	discountedPrice: Joi.number().min(0).allow(null),
	imageCount: Joi.number().min(0).default(0).allow(null),
	purchasable: Joi.boolean().default(true).required(),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null)
}).with('colorGroup', ['color']).required()

export const updateProductSchema = Joi.object({
	categoryId: Joi.string().allow(null),
	subCategoryId: Joi.string().allow(null),
	brand: Joi.string().allow(null),
	name: Joi.string().allow(null),
	details: Joi.string().allow(null, ''),
	type: Joi.string().required(),
	specifications: Joi.array().min(1).items(productSpecificationsSchema).sparse(false).allow(null),
	price: Joi.number().min(0).allow(null),
	discountedPrice: Joi.number().min(0).allow(null),
	imageCount: Joi.number().min(0).default(0).allow(null),
	purchasable: Joi.boolean().allow(null),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null)
}).with('colorGroup', ['color']).required()

const typeSpecificationSchema = Joi.object({
	_id: Joi.string().required(),
	name: Joi.string().required()
})

export const saveTypeSchema = Joi.object({
	name: Joi.string().required(),
	specifications: Joi.array().min(1).items(typeSpecificationSchema).sparse(false).allow(null)
})

export const updateTypeSchema = Joi.object({
	name: Joi.string().required(),
	specifications: Joi.array().min(1).items(typeSpecificationSchema).sparse(false).allow(null)
})