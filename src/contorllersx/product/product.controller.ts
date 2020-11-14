import { validateAuthority } from '../../middlewares/auth-middleware';
import { Router } from 'express'

import {
    search,
    getSingleProduct,
    getProductAndWithColorGroup,
    getRelatedProducts,
    getProducts,
    getProductsWithCategories as getProductsInCategories, // TODO rename function remove as
    getBestSellerProducts,
    getBestSellerMobileProducts,
    getMostSearchedMobileProducts,
    addProductToCart,
    takeOffProductFromCart,
    filterShop,
    getFilteredProductsWithCategories,
    productsFilterMobile,
    validateObjectId,
    setProductToCart,
    updateProductsSearchTimes
} from '../../services/unauthorized'

import {
    validateGetProductsFilterWithCategoriesRequest,
    validateGetProductsFilterMobileRequest,
    validateSetProductRequest,
    validatePutDeductProduct
} from '../../validators/unauthorized-validator'
import Authority from '../../enums/authority-enum';
import { getSeoUrl, isProductSlugExists, updateProduct, indexProduct, saveProductImages, saveProductToDatabase, updateCategoryOfProduct } from '../../services/admin';
import { validatePostProduct, validateUpdateProduct } from '../../validators/admin-validator';

const router = Router()

router.get('/', async (_, res) => {
    const products = await getProducts()

    res.json(products)
})

router.get('/in-categories', async (_, res) => {
    const result = await getProductsInCategories()

    res.json(result)
})

// FOR WEB
router.get('/best-seller', async (_, res) => {
    const products = await getBestSellerProducts()

    res.json(products)
})

// FOR MOBILE
router.get('/best-seller-mobile', async (_, res) => {
    const bestSeller = await getBestSellerMobileProducts()

    res.json(bestSeller)
})

// FOR MOBILE
router.get('/most-searched-mobile', async (req, res, next) => {
    const products = await getMostSearchedMobileProducts()

    res.json(products)
})

// FOR WEB
router.get('/filter-shop/:category?/:subCategory?', async (req, res, next) => {
    const shop = await filterShop(req.query, req.params)

    res.json(shop)
})

// FOR MOBILE // TODO DELETE
router.get('/filter-with-categories', async (req, res) => {
    await Promise.all([validateObjectId(req.query.categoryId), validateGetProductsFilterWithCategoriesRequest(req.query)])
    const response = (await getFilteredProductsWithCategories(req.query))[0]

    res.json(response)
})

// FOR MOBILE
router.get('/filter-mobile', async (req, res, next) => {
    await validateGetProductsFilterMobileRequest(req.query)
    const response = await productsFilterMobile(req.query)

    res.json(response)
})

router.put('/add-product/:_id', async (req, res, next) => {
    await validateObjectId(req.params._id)
    const { product, cart } = await getSingleProduct(req.params._id, req.user)
    const response = await addProductToCart(product, cart || null, req.user, req.body.quantity)

    res.json(response)
})

router.put('/deduct-product/:_id', async (req, res) => {
    await Promise.all([validateObjectId(req.params._id), validatePutDeductProduct(req.body)])
    const { product, cart } = await getSingleProduct(req.params._id, req.user)
    const response = await takeOffProductFromCart(product, cart || null, req.user, req.body.quantity)

    res.json(response)
})

router.put('/set-product/:_id', async (req, res) => {
    await Promise.all([validateObjectId(req.params._id), validateSetProductRequest(req.body)])
    const { product, cart } = await getSingleProduct(req.params._id, req.user)
    const response = await setProductToCart(product, cart || null, req.user, req.body.quantity)

    res.json(response)
})

router.get('/product/:slug', async (req, res, next) => {
    const productWithColorGroup = (await getProductAndWithColorGroup(req.params.slug))[0]
    await updateProductsSearchTimes(productWithColorGroup?._id, req.query.fromSearch)

    res.json(productWithColorGroup)
})

router.get('/related-products/:slug', async (req, res) => {
    const relatedProducts = await getRelatedProducts(req.params.slug)

    res.json(relatedProducts)
})

router.get('/search-product', async (req, res) => {
    const result = await search(req.query.name)

    res.json(result.body.hits.hits)
})

router.post('/', async (req, res) => {
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

    await validatePostProduct(req.body)
    const slug = getSeoUrl(req.body.name)
    await isProductSlugExists(slug)
    const product = await saveProductToDatabase({ ...req.body, slug })
    await updateCategoryOfProduct(product)
    await indexProduct(product)

    if (req.files?.images) {
        saveProductImages(product, Object.values(req.files.images))
    }

    res.json(product)
})


router.put('/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
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

    await validateUpdateProduct(req.body)
    const slug = getSeoUrl(req.body.name)
    await isProductSlugExists(slug, req.params._id)
    const product = await updateProduct(req.params._id, req.body, slug)
    await indexProduct(product)

    if (req.files) {
        saveProductImages(product, Object.values(req.files))
    }

    res.json(product)
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