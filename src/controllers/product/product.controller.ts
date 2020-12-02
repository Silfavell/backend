import { Router } from 'express'

import {
	search,
	getSingleProduct,
	getProductAndWithColorGroup,
	getRelatedProducts,
	getProducts,
	getProductsInCategories,
	getBestSellerProducts,
	getBestSellerMobileProducts,
	getMostSearchedMobileProducts,
	addProductToCart,
	takeOffProductFromCart,
	filterShop,
	getFilteredProductsWithCategories,
	productsFilterMobile,
	setProductToCart,
	updateProductsSearchTimes,
	isProductSlugExists,
	updateProduct,
	indexProduct,
	saveProductImages,
	saveProductToDatabase,
	updateCategoryOfProduct,
	getFavoriteProductsFromDatabase,
	saveFavoriteProductToDatabase,
	removeFavoriteProductFromDatabase,
} from './product.service'

import {
	productsFilterWithCategoriesSchema,
	productsFilterMobileSchema,
	setProductSchema,
	putDeductProductSchema,
	saveProductSchema,
	updateProductSchema,
	favoriteProductSchema
} from './product.validator'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { validateObjectId } from '../../utils/validate-object-id'
import { getSeoUrl } from '../../utils/seo-url'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.get('/', async (req, res, next) => {
	try {
		const products = await getProducts()

		res.json(products)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/in-categories', async (req, res, next) => {
	try {
		const result = await getProductsInCategories()

		res.json(result)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

// FOR WEB
router.get('/best-seller', async (req, res, next) => {
	try {
		const products = await getBestSellerProducts()

		res.json(products)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

// FOR MOBILE
router.get('/best-seller-mobile', async (req, res, next) => {
	try {
		const bestSeller = await getBestSellerMobileProducts()

		res.json(bestSeller)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

// FOR MOBILE
router.get('/most-searched-mobile', async (req, res, next) => {
	try {
		const products = await getMostSearchedMobileProducts()

		res.json(products)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

// FOR WEB
router.get('/filter-shop/:category?/:subCategory?', async (req, res, next) => {
	try {
		const shop = await filterShop(req.query, req.params)

		res.json(shop)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

// FOR MOBILE // TODO DELETE
router.get('/filter-with-categories', async (req, res, next) => {
	try {
		await Promise.all([validateObjectId(req.query.categoryId), productsFilterWithCategoriesSchema.validateAsync(req.query)])
		const response = await getFilteredProductsWithCategories(req.query)

		res.json(response[0])
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

// FOR MOBILE
router.get('/filter-mobile', async (req, res, next) => {
	try {
		await productsFilterMobileSchema.validateAsync(req.query)
		const response = await productsFilterMobile(req.query)

		res.json(response)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/add-quantity/:_id', async (req, res, next) => {
	try {
		await validateObjectId(req.params._id)
		const { product, cart } = await getSingleProduct(req.params._id, req.user)
		const response = await addProductToCart(product, cart || null, req.user, req.body.quantity)

		res.json(response)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/deduct-quantity/:_id', async (req, res, next) => {
	try {
		await Promise.all([validateObjectId(req.params._id), putDeductProductSchema.validateAsync(req.body)])
		const { product, cart } = await getSingleProduct(req.params._id, req.user)
		const response = await takeOffProductFromCart(product, cart || null, req.user, req.body.quantity)

		res.json(response)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/set-quantity/:_id', async (req, res, next) => {
	try {
		await Promise.all([validateObjectId(req.params._id), setProductSchema.validateAsync(req.body)])
		const { product, cart } = await getSingleProduct(req.params._id, req.user)
		const response = await setProductToCart(product, cart || null, req.user, req.body.quantity)

		res.json(response)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/search', async (req, res, next) => {
	try {
		const result = await search(req.query.name)

		res.json(result.body.hits.hits)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		if (req.files?.images) {
			if (!Array.isArray(req.files.images)) {
				req.files.images = [req.files.images]
			}
			req.body.imageCount = Object.keys(req.files.images).length
		}

		if (req.body.color) {
			req.body.color = JSON.parse(req.body.color)
		}

		if (req.body.purchasable) {
			req.body.purchasable = req.body.purchasable === 'true'
		}

		if (req.body.specifications) {
			req.body.specifications = JSON.parse(req.body.specifications)

			req.body.specifications = req.body.specifications.map((spec: any) => ({
				...spec,
				slug: getSeoUrl(spec.name)
			}))
		}

		await saveProductSchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isProductSlugExists(slug)
		const product = await saveProductToDatabase({ ...req.body, slug })
		await updateCategoryOfProduct(product)
		await indexProduct(product)

		if (req.files?.images) {
			saveProductImages(product, Object.values(req.files.images))
		}

		res.json(product)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})


router.put('/:_id', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		if (req.files?.images) {
			if (!Array.isArray(req.files.images)) {
				req.files.images = [req.files.images]
			}
			req.body.imageCount = Object.keys(req.files.images).length
		}

		if (req.body.color) {
			req.body.color = JSON.parse(req.body.color)
		}

		if (req.body.purchasable) {
			req.body.purchasable = req.body.purchasable === 'true'
		}

		if (req.body.specifications) {
			req.body.specifications = JSON.parse(req.body.specifications)

			req.body.specifications = req.body.specifications.map((spec: any) => ({
				...spec,
				slug: getSeoUrl(spec.name)
			}))
		}

		await updateProductSchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isProductSlugExists(slug, req.params._id)
		const product = await updateProduct(req.params._id, req.body, slug)
		await indexProduct(product)

		if (req.files) {
			saveProductImages(product, Object.values(req.files))
		}

		res.json(product)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/favorites', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		const favoriteProducts = await getFavoriteProductsFromDatabase(req.user._id)

		res.json(favoriteProducts[0])
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/favorites', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		await favoriteProductSchema.validateAsync(req.body)
		const { favoriteProducts } = await saveFavoriteProductToDatabase(req.user._id, req.body)

		res.json(favoriteProducts)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.delete('/favorites/:_id', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		await favoriteProductSchema.validateAsync(req.params)
		const { favoriteProducts } = await removeFavoriteProductFromDatabase(req.user._id, req.params._id)

		res.json(favoriteProducts)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/:slug', async (req, res, next) => {
	try {
		const productWithColorGroup = await getProductAndWithColorGroup(req.params.slug)
		if(productWithColorGroup[0]){
			await updateProductsSearchTimes(productWithColorGroup[0]._id, req.query.fromSearch)
		}

		res.json(productWithColorGroup[0])
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/:slug/related-products', async (req, res, next) => {
	try {
		const relatedProducts = await getRelatedProducts(req.params.slug)

		res.json(relatedProducts)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

/*
	router.delete('/product/:_id', (req, res, next) => {
		validateObjectId(req.params._id)
			.then(() => deleteProductFromDatabase(req.params._id))
			.then((product) => removeProductFromSearch(product))
			.then(() => {
				res.json()
			})
			.catch((reason) => {
				next(handleError(reason, 'DELETE /admin/product/:_id'))
			})
	})
*/

export default router