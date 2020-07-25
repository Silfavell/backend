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
	name: Joi.string().required()
}).required()

export const deleteSubCategorySchema = Joi.object({
	parentCategoryId: Joi.string().required(),
	_id: Joi.string().required()
}).required()

const colorSchema = Joi.object({
	name: Joi.string().required(),
	code: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/).required()
})

const specificationsSchema = Joi.object({
	form: Joi.string().allow(null),
	benefit: Joi.string().allow(null),
	colorDetail: Joi.string().allow(null),
	kind: Joi.string().allow(null),
	brushThickness: Joi.string().allow(null),
	feature: Joi.string().allow(null)
})

export const saveProductSchema = Joi.object({
	categoryId: Joi.string().required(),
	subCategoryId: Joi.string().required(),
	brand: Joi.string().required(),
	name: Joi.string().required(),
	details: Joi.string().allow(null, ''),
	specifications: specificationsSchema.allow(null),
	price: Joi.number().min(0).required(),
	discountedPrice: Joi.number().min(0).allow(null),
	imageCount: Joi.number().min(0).default(0).allow(null),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null)
}).with('colorGroup', ['color']).required()

export const updateProductSchema = Joi.object({
	categoryId: Joi.string().allow(null),
	subCategoryId: Joi.string().allow(null),
	brand: Joi.string().allow(null),
	name: Joi.string().allow(null),
	details: Joi.string().allow(null, ''),
	specifications: specificationsSchema.allow(null),
	price: Joi.number().min(0).allow(null),
	discountedPrice: Joi.number().min(0).allow(null),
	imageCount: Joi.number().min(0).default(0).allow(null),
	colorGroup: Joi.string().allow(null),
	color: colorSchema.allow(null)
}).with('colorGroup', ['color']).required()