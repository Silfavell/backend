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

export const indexProduct = (product: ProductDocument) => (
	Elasticsearch.getClient
		.index({
			index: 'doc',
			type: 'doc',
			// refresh: true,
			body: replaceProductId(product)
		})
		.then(() => product)
)

export const updateProduct = (productId: string, productContext: ProductDocument) => (
	Product.findByIdAndUpdate(productId, productContext, { new: true })
)

export const deleteProductFromDatabase = (productId: string) => (
	Product.findByIdAndDelete(productId)
)