import {
	// eslint-disable-next-line no-unused-vars
	ProductDocument, CategoryDocument
} from '../models'

import {
	saveProductSchema,
	updateProductSchema,
	categorySchema,
	saveSubCategorySchema,
	deleteSubCategorySchema,
} from '../schemas/admin-schema'

export const validatePostCategory = (category: CategoryDocument) => (
	categorySchema.validateAsync(category)
)

export const validatePostSubCategory = (body: any) => (
	saveSubCategorySchema.validateAsync(body)
)

export const validateDeleteSubCategory = (body: any) => (
	deleteSubCategorySchema.validateAsync(body)
)

export const validateUpdateCategory = (category: CategoryDocument) => (
	categorySchema.validateAsync(category)
)

export const validatePostProduct = (product: ProductDocument) => (
	saveProductSchema.validateAsync(product)
)

export const validateUpdateProduct = (product: ProductDocument) => (
	updateProductSchema.validateAsync(product)
)