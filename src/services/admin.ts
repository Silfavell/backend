import { Redis, Elasticsearch } from '../startup'

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

export const deleteCategoryFromDatabase = (categoryId: string) => (
	Category.findByIdAndDelete(categoryId)
)

export const updateCategory = (categoryId: string, categoryContext: CategoryDocument) => (
	Category.findByIdAndUpdate(categoryId, categoryContext)
)

export const saveCategoryToCache = () => (
	Category.find().then((categories) => (
		Redis.getInstance.setAsync('categories', JSON.stringify(categories))
	))
)

export const saveProductToDatabase = (productContext: ProductDocument) => (
	new Product(productContext).save()
)

export const saveProductToCache = (product: ProductDocument | any) => {
	const multi = Redis.getInstance.multi()

	multi.set(product._id.toString(), JSON.stringify(product))
	multi.rpush(`products:${product.category}`, JSON.stringify(product))

	return multi.execAsync().then(() => product)
}

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

export const deleteProductFromCache = (product: ProductDocument | any) => (
	Redis.getInstance.del(product._id.toString())
)

export const updateProduct = (productId: string, productContext: ProductDocument) => (
	Product.findByIdAndUpdate(productId, productContext, { new: true })
)

export const deleteProductFromDatabase = (productId: string) => (
	Product.findByIdAndDelete(productId)
)