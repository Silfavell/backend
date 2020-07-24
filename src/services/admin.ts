import fs from 'fs'
import { Elasticsearch } from '../startup'
import HttpStatusCodes from 'http-status-codes'

// eslint-disable-next-line no-unused-vars
import {
	Product,
	Category,
	Manager,
	// eslint-disable-next-line no-unused-vars
	ProductDocument,
	// eslint-disable-next-line no-unused-vars
	CategoryDocument
} from '../models'
import Brand from '../models/Brand'
import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'

const replaceProductId = (product: ProductDocument) => (
	JSON.parse(JSON.stringify(product).split('"_id":').join('"id":')) // TODO ??
)

export const getSeoUrl = (name: string) => {
	return name.toString()               // Convert to string
		.normalize('NFD')                // Change diacritics
		.replace(/[\u0300-\u036f]/g, '') // Remove illegal characters
		.replace(/\s+/g, '-')            // Change whitespace to dashes
		.toLowerCase()                   // Change to lowercase
		.replace(/&/g, '-and-')          // Replace ampersand
		.replace(/[^a-z0-9\-]/g, '')     // Remove anything that is not a letter, number or dash
		.replace(/-+/g, '-')             // Remove duplicate dashes
		.replace(/^-*/, '')              // Remove starting dashes
		.replace(/-*$/, '');             // Remove trailing dashes
}

export const verifyManager = (managerId: string) => (
	Manager.findByIdAndUpdate(managerId, { verified: true }, { new: true })
)

export const saveCategoryToDatabase = (categoryContext: CategoryDocument) => (
	new Category(categoryContext).save()
)

export const saveSubCategoryToDatabase = (body: any) => (
	Category.findByIdAndUpdate(body.parentCategoryId, {
		$push: {
			subCategories: {
				name: body.name,
				slug: body.slug
			}
		}
	}, { new: true })
)

export const deleteSubCategoryFromDatabase = (body: any) => (
	Category.findByIdAndUpdate(body.parentCategoryId, {
		$pull: {
			subCategories: {
				_id: body._id
			}
		}
	}, { new: true })
)

export const deleteCategoryFromDatabase = (categoryId: string) => (
	Category.findByIdAndDelete(categoryId)
)

export const updateCategory = (categoryId: string, categoryContext: CategoryDocument) => (
	Category.findByIdAndUpdate(categoryId, categoryContext)
)

export const isSubCategorySlugExists = (body: any, slug: string) => ( // is category exists ? isSubCategoryExists ? test. // TODO
	Category.findById(body.parentCategoryId).then((parentCategory) => {
		const subCategory = parentCategory.subCategories.find((subCategory) => subCategory.slug === slug)

		if (subCategory) {
			throw new ServerError(ErrorMessages.ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME, false)
		}

		return slug;
	})
)

export const updateSubCategory = (body: any, slug: string) => ( // is category exists ? isSubCategoryExists ? test. // TODO
	Category.findById(body.parentCategoryId).then((parentCategory) => {
		const subCategory = parentCategory.subCategories.find((subCategory) => subCategory._id.toString() === body.subCategoryId)
		subCategory.name = body.name
		subCategory.slug = slug
		return parentCategory.save()
	})
)

export const isProductSlugExists = (slug: string) => (
	Product.findOne({ slug }).then((product) => {
		if (product) {
			throw new ServerError(ErrorMessages.ANOTHER_PRODUCT_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_PRODUCT_WITH_THE_SAME_NAME, false)
		}

		return slug;
	})
)

export const isCategorySlugExists = (slug: string) => (
	Category.findOne({ slug }).then((category) => {
		if (category) {
			throw new ServerError(ErrorMessages.ANOTHER_CATEGORY_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_CATEGORY_WITH_THE_SAME_NAME, false)
		}

		return slug;
	})
)

export const saveProductToDatabase = (productBody: any) => (
	new Product(productBody).save()
)

export const updateCategoryOfProduct = (product: any) => (
	Category.findById(product.categoryId.toString()).then((category) => {
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

		return category.save().then(() => product)
	})
)

export const saveProductImages = (product: ProductDocument, images: any[]) => {
	images.map((image, index) => {
		fs.writeFile(`./public/assets/products/${product.image}-${index}.webp`, image.data, 'binary', (err) => {
			if (err) throw err
		})
	})
}

export const indexProduct = (product: ProductDocument) => (
	Elasticsearch.getClient
		.index({
			index: 'doc',
			type: 'doc',
			id: product._id,
			// refresh: true,
			body: replaceProductId(product)
		})
)

export const removeProductFromSearch = (product: ProductDocument) => (
	Elasticsearch.getClient
		.delete({
			index: 'doc',
			type: 'doc',
			id: product._id
		})
)

export const updateProduct = (productId: string, productContext: ProductDocument) => (
	Product.findByIdAndUpdate(productId, productContext, { new: true })
)

export const deleteProductFromDatabase = (productId: string) => (
	Product.findByIdAndDelete(productId)
)