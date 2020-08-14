import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import rateLimit from 'express-rate-limit'

import Authority from '../enums/authority-enum'

import { validateAuthority, validatePhone } from '../middlewares/auth-middleware'

import {
	registerUser,
	registerManager,
	createActivationCode,
	login,
	search,
	getSingleProduct,
	getProductAndWithColorGroup,
	getRelatedProducts,
	getProductsWithCategories,
	getBestSellerProducts,
	getBestSellerMobileProducts,
	getCategories,
	addProductToCart,
	isManagerVerified,
	handleError,
	checkConvenientOfActivationCodeRequest,
	createToken,
	takeOffProductFromCart,
	changePassword,
	sendActivationCode,
	filterShop,
	getFilteredProductsWithCategories,
	productsFilterMobile,
	validateObjectId,
	setProductToCart,
	saveTicket
} from '../services/unauthorized'

import {
	isUserNonExists,
	isUserExists,
	getActivationCode,
	compareActivationCode,
	isManagerNonExists,
	isManagerExists
} from '../validators'

import {
	validateSendActivationCodeRequest,
	validateRegisterRequest,
	validateRegisterManagerRequest,
	validateLoginRequest,
	validateResetPasswordRequest,
	validatePostTicketRequest,
	validateGetProductsFilterWithCategoriesRequest,
	validateGetProductsFilterMobileRequest,
	validateSetProductRequest,
	validatePutDeductProduct
} from '../validators/unauthorized-validator'

import ActivationCodes from '../enums/activation-code-enum'
import { ProductDocument } from '../models'

const apiLimiter = rateLimit({
	windowMs: 6 * 60 * 60 * 1000, // 6 Hours
	max: 5
})

const router = Router()

router.use(validateAuthority(Authority.ANONIM))
router.use(validatePhone())

router.get('/categories', (req, res, next) => {
	getCategories().then((categories) => {
		res.json(categories)
	}).catch((reason) => {
		next(handleError(reason, 'GET /categories'))
	})
})

router.get('/products-with-categories', (req, res, next) => {
	getProductsWithCategories(req.query).then((products) => {
		res.json(products)
	}).catch((reason) => {
		next(handleError(reason, 'GET /products-with-categories'))
	})
})

// FOR WEB
router.get('/best-seller', (req, res, next) => {
	getBestSellerProducts().then((products) => {
		res.json(products)
	}).catch((reason) => {
		next(handleError(reason, 'GET /best-seller'))
	})
})

// FOR MOBILE
router.get('/best-seller-mobile', (req, res, next) => {
	getBestSellerMobileProducts().then((products) => {
		res.json(products)
	}).catch((reason) => {
		next(handleError(reason, 'GET /best-seller-mobile'))
	})
})

// FOR WEB
router.get('/filter-shop/:category?/:subCategory?', (req, res, next) => {
	filterShop(req.query, req.params).then((shop) => {
		res.json(shop)
	}).catch((reason) => {
		next(handleError(reason, 'GET /products-filter'))
	})
})

// FOR MOBILE // TODO DELETE
router.get('/products-filter-with-categories', (req, res, next) => {
	validateObjectId(req.query.categoryId)
		.then(() => validateGetProductsFilterWithCategoriesRequest(req.query))
		.then(() => getFilteredProductsWithCategories(req.query))
		.then((products) => {
			res.json(products[0])
		}).catch((reason) => {
			next(handleError(reason, 'GET /products-filter-with-categories'))
		})
})

// FOR MOBILE
router.get('/products-filter-mobile', (req, res, next) => {
	validateGetProductsFilterMobileRequest(req.query)
		.then(() => productsFilterMobile(req.query))
		.then((result) => {
			res.json(result[0])
		}).catch((reason) => {
			next(handleError(reason, 'GET /products-filter-mobile'))
		})
})

router.put('/add-product/:_id', (req, res, next) => {
	validateObjectId(req.params._id)
		.then(() => getSingleProduct(req.params._id, req.user))
		.then(({ product, cart }) => addProductToCart(product, cart || null, req.user, req.body.quantity))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next((handleError(reason, 'PUT /add-product/:_id')))
		})
})

router.put('/set-product/:_id', (req, res, next) => {
	validateObjectId(req.params._id)
		.then(() => validateSetProductRequest(req.body))
		.then(() => getSingleProduct(req.params._id, req.user))
		.then(({ product, cart }) => setProductToCart(product, cart || null, req.user, req.body.quantity))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next((handleError(reason, 'PUT /set-product/:_id')))
		})
})

router.get('/product/:slug', (req, res, next) => {
	getProductAndWithColorGroup(req.params.slug)
		.then((response: any) => {
			res.json(response[0])
		})
		.catch((reason) => {
			next((handleError(reason, 'GET /product/:slug')))
		})
})

router.get('/related-products/:slug', (req, res, next) => {
	getRelatedProducts(req.params.slug)
		.then((response: ProductDocument[]) => {
			res.json(response)
		})
		.catch((reason) => {
			next((handleError(reason, 'GET /related-products/:slug')))
		})
})

router.put('/deduct-product/:_id', (req, res, next) => {
	validateObjectId(req.params._id)
		.then(() => validatePutDeductProduct(req.body))
		.then(() => getSingleProduct(req.params._id, req.user))
		.then(({ product, cart }) => takeOffProductFromCart(product, cart || null, req.user, req.body.quantity))
		.then((response: any) => {
			res.json(response)
		})
		.catch((reason) => {
			next((handleError(reason, 'PUT /deduct-product/:_id')))
		})
})

router.get('/search-product', (req, res, next) => {
	search(req.query.name)
		.then((vals: any) => {
			res.json(vals.body.hits.hits)
		})
		.catch((reason) => {
			next((handleError(reason, 'GET /search-product')))
		})
})

router.post('/send-activation-code', (req, res, next) => {
	validateSendActivationCodeRequest({ phoneNumber: req.body.phoneNumber, activationCodeType: req.body.activationCodeType })
		.then(() => checkConvenientOfActivationCodeRequest(req.body.phoneNumber, req.body.activationCodeType))
		.then(() => createActivationCode(req.body.phoneNumber, req.body.activationCodeType))
		.then((activationCode) => sendActivationCode(req.body.phoneNumber, activationCode))
		.then(() => {
			res.status(HttpStatusCodes.ACCEPTED).json()
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /send-activation-code'))
		})
})

router.post('/register', (req, res, next) => {
	validateRegisterRequest(req.body)
		.then(() => isUserNonExists(req.body.phoneNumber))
		.then(() => getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_USER))
		.then((activationCode) => compareActivationCode(req.body.activationCode, activationCode.toString()))
		.then(() => registerUser(req.body))
		.then((user) => createToken(user).then((token) => ({ user, token })))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /register'))
		})
})

router.post('/register-manager', (req, res, next) => {
	validateRegisterManagerRequest(req.body)
		.then(() => isManagerNonExists(req.body.phoneNumber))
		.then(() => getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_MANAGER))
		.then((activationCode) => compareActivationCode(req.body.activationCode, activationCode.toString()))
		.then(() => registerManager({ ...req.body, ...{ verified: false } }))
		.then(() => {
			res.json()
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /register-manager'))
		})
})

router.post('/login-manager', apiLimiter, (req, res, next) => {
	validateLoginRequest(req.body)
		.then(() => isManagerExists(req.body.phoneNumber))
		.then((manager) => login(manager, req.body.password))
		.then((manager) => isManagerVerified(manager).then(() => manager))
		.then((manager) => createToken(manager).then((token) => ({ manager, token })))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /login-manager'))
		})
})

router.post('/login', (req, res, next) => {
	validateLoginRequest(req.body)
		.then(() => isUserExists(req.body.phoneNumber))
		.then((user) => login(user, req.body.password))
		.then((user) => createToken(user).then((token) => ({ user, token })))
		.then((response) => {
			res.json(response)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /login'))
		})
})

router.put('/reset-password', (req, res, next) => {
	validateResetPasswordRequest(req.body)
		.then(() => isUserExists(req.body.phoneNumber))
		.then(() => getActivationCode(req.body.phoneNumber, ActivationCodes.RESET_PASSWORD))
		.then((activationCode) => compareActivationCode(req.body.activationCode, activationCode.toString()))
		.then(() => isUserExists(req.body.phoneNumber))
		.then((user) => changePassword(user, req.body.newPassword))
		.then(() => {
			res.json()
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /reset-password'))
		})
})

router.post('/ticket', (req, res, next) => {
	validatePostTicketRequest(req.body)
		.then(() => saveTicket(req.body))
		.then((ticket) => {
			res.json(ticket)
		}).catch((reason) => {
			next(handleError(reason, 'POST /ticket'))
		})
})

export default router