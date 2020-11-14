import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

const Joi = JoiBase.extend(JoiPhoneNumber)

const colorSchema = Joi.object({
	name: Joi.string().required(),
	code: Joi.string().regex(/^#[A-Fa-f0-9]{6}$/).required()
})

const productSpecificationsSchema = Joi.object({
	name: Joi.string().required(),
	slug: Joi.string().required(),
	value: Joi.string().required()
})

export const productsFilterWithCategoriesSchema = Joi.object({
	categoryId: Joi.string().length(24).required(),
	brands: Joi.string().allow('', null),
	sortType: Joi.string().allow('', null)
})

export const productsFilterMobileSchema = Joi.object({
	categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	subCategoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
	brands: Joi.alternatives(
		Joi.array().min(1).items(Joi.string()),
		Joi.string()
	).allow(null),
	sortType: Joi.string().regex(/[0-6]/).allow(null),
	minPrice: Joi.string().regex(/^[0-9]+$/).allow(null),
	maxPrice: Joi.string().regex(/^[0-9]+$/).allow(null)
})
	.with('minPrice', ['maxPrice'])
	.with('maxPrice', ['minPrice'])

export const setProductSchema = Joi.object({
	quantity: Joi.number().min(0).required()
})

export const putDeductProductSchema = Joi.object({
	quantity: Joi.number().min(1).required()
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