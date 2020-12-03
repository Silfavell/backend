import HttpStatusCodes from 'http-status-codes'

import {
	Category,
	ProductDocument,
	CategoryDocument,
	ProductType,
} from '../../models'
import Brand from '../../models/Brand'
import ServerError from '../../errors/ServerError'
import ErrorMessages from '../../errors/ErrorMessages'

export const getCategories = () => (
	Category.aggregate([
		{
			$unwind: {
				path: '$subCategories',
				preserveNullAndEmptyArrays: true
			}
		},/*
		{
			$addFields: {
				subCategories: { $ifNull: ['$subCategories', { types: [] }] }
			}
		},*/
		{
			$match: {
				'subCategories.brands': {
					$exists: true,
					$not: {
						$size: 0
					}
				}
			}
		},
		{
			$lookup: {
				from: ProductType.collection.name,
				let: { types: '$subCategories.types' },
				pipeline: [
					{
						$match: {
							$expr: {
								$in: ['$_id', '$$types']
							}
						}
					}
				],
				as: 'subCategories.types'
			}
		},
		{
			$group: {
				_id: '$_id',
				imagePath: { $first: '$imagePath' },
				name: { $first: '$name' },
				slug: { $first: '$slug' },
				brands: { $first: '$brands' },
				subCategories: { $push: '$subCategories' }
			}
		},
		{
			$project: {
				_id: 1,
				imagePath: 1,
				name: 1,
				slug: 1,
				brands: 1,
				subCategories: {
					$filter: {
						input: '$subCategories',
						as: 'subCategory',
						cond: { $gt: ['$$subCategory._id', null] }
					}
				}
			}
		},
		{
			$sort: {
				imagePath: 1
			}
		}
	])
)


export const saveCategoryToDatabase = (categoryContext: CategoryDocument) => new Category(categoryContext).save()

export const saveSubCategoryToDatabase = (body: any) => Category.findByIdAndUpdate(body.parentCategoryId, {
	$push: {
		subCategories: body
	}
}, { new: true })

export const deleteSubCategoryFromDatabase = (body: any) => Category.findByIdAndUpdate(body.parentCategoryId, {
	$pull: {
		subCategories: {
			_id: body._id
		}
	}
}, { new: true })

export const deleteCategoryFromDatabase = async (categoryId: string) => {
	const category = await Category.findById(categoryId)

	if (!category) {
		throw new ServerError(ErrorMessages.CATEGORY_IS_NOT_EXISTS, HttpStatusCodes.BAD_REQUEST, ErrorMessages.CATEGORY_IS_NOT_EXISTS, false)
	}

	return await category.remove()
}

export const updateCategory = (categoryId: string, categoryContext: CategoryDocument) => Category.findByIdAndUpdate(categoryId, categoryContext)

export const isSubCategorySlugExists = async (body: any, slug: string) => { // is category exists ? isSubCategoryExists ? test. // TODO
	const parentCategory = await Category.findById(body.parentCategoryId)
	const subCategory = parentCategory.subCategories.find((subCategory) => subCategory.slug === slug)

	if (subCategory && body.subCategoryId !== subCategory._id.toString()) {
		throw new ServerError(ErrorMessages.ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME, false)
	}

	return slug
}

export const updateSubCategory = async (body: any, slug: string) => { // is category exists ? isSubCategoryExists ? test. // TODO
	const parentCategory = await Category.findById(body.parentCategoryId)
	const subCategory = parentCategory.subCategories.find((subCategory) => subCategory._id.toString() === body.subCategoryId)
	subCategory.name = body.name
	subCategory.types = body.types
	subCategory.slug = slug

	return parentCategory.save()
}

export const isCategorySlugExists = async (slug: string, updateId?: string) => {
	const category = await Category.findOne({ slug })
	if (category && updateId !== category._id.toString()) {
		throw new ServerError(ErrorMessages.ANOTHER_CATEGORY_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_CATEGORY_WITH_THE_SAME_NAME, false)
	}

	return slug
}

export const updateCategoryOfProduct = async (product: ProductDocument) => {
	const category = await Category.findById(product.categoryId.toString())

	const productCategoryBrand = category.brands.find((brand) => brand.name === product.brand)
	const productSubCategory = category.subCategories.find((subCategory) => subCategory._id.toString() === product.subCategoryId.toString())
	const productSubCategoryBrand = productSubCategory.brands.find((brand) => brand.name === product.brand)

	if (productCategoryBrand) {
		// eslint-disable-next-line no-param-reassign
		category.brands[category.brands.indexOf(productCategoryBrand)].productQuantity++

		if (productSubCategoryBrand) {
			productSubCategory.brands[productSubCategory.brands.indexOf(productSubCategoryBrand)].productQuantity++
		} else {
			productSubCategory.brands.push(new Brand({ name: product.brand, productQuantity: 1 }))
		}
	} else {
		category.brands.push(new Brand({ name: product.brand, productQuantity: 1 }))
		productSubCategory.brands.push(new Brand({ name: product.brand, productQuantity: 1 }))
	}

	await category.save()

	return product
}
