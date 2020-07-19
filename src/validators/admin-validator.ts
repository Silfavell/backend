import {
	saveProductSchema,
	updateProductSchema,
	categorySchema,
	saveSubCategorySchema,
	updateSubCategorySchema,
	deleteSubCategorySchema,
} from '../schemas/admin-schema'

export const validatePostCategory = (category: any) => categorySchema.validateAsync(category)

export const validatePostSubCategory = (body: any) => saveSubCategorySchema.validateAsync(body)

export const validateDeleteSubCategory = (body: any) => deleteSubCategorySchema.validateAsync(body)

export const validateUpdateCategory = (category: any) => categorySchema.validateAsync(category)

export const validateUpdateSubCategory = (subCategory: any) => updateSubCategorySchema.validateAsync(subCategory)

export const validatePostProduct = (product: any) => saveProductSchema.validateAsync(product)

export const validateUpdateProduct = (product: any) => updateProductSchema.validateAsync(product)