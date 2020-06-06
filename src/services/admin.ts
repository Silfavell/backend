import { Elasticsearch } from '../startup'

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

const replaceProductId = (product: ProductDocument) => (
	JSON.parse(JSON.stringify(product).split('"_id":').join('"id":')) // TODO ??
)

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
				name: body.name
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


export const saveProductToDatabase = (productContext: ProductDocument) => (
	new Product(productContext).save()
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

export const indexProduct = (product: ProductDocument) => (
	Elasticsearch.getClient
		.index({
			index: 'doc',
			type: 'doc',
			// refresh: true,
			body: replaceProductId(product)
		})
)

export const updateProduct = (productId: string, productContext: ProductDocument) => (
	Product.findByIdAndUpdate(productId, productContext, { new: true })
)

export const deleteProductFromDatabase = (productId: string) => (
	Product.findByIdAndDelete(productId)
)