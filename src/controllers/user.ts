import { Router } from 'express'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'

import {
	handleError,
	changePassword
} from '../services/unauthorized'

import {
	listCards,
	addCardToUser,
	updateUser,
	saveCart,
	deleteAddress,
	getCart,
	saveOrderToDatabase,
	updateProductsSoldTimes,
	getOrders,
	getFavoriteProductsFromDatabase,
	saveFavoriteProductToDatabase,
	removeFavoriteProductFromDatabase,
	completePayment,
	checkMakeOrderValues,
	saveAddressToDatabase,
	deleteCard,
	clearCart,
	validateSaveCartProducts,
	getOrderById,
	saveComment
} from '../services/user'

import {
	comparePasswords,
	isUserExists
} from '../validators'

import {
	validateUpdateProfileRequest,
	validateSaveCartRequest,
	validateSaveAddressRequest,
	validateChangePasswordRequest,
	validateMakeOrderRequest,
	validatePostPaymentCardRequest,
	validateDeletePaymentCardRequest,
	validateFavoriteProductRequest,
	validateSaveComment
} from '../validators/user-validator'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/list-cards', (req, res, next) => {
	listCards(req.user.cardUserKey).then((cards) => {
		res.json(cards)
	}).catch((reason) => {
		next(handleError(reason, 'GET /user/list-cards'))
	})
})

router.post('/payment-card', (req, res, next) => {
	// addCardToUser(req.user.cardUserKey, req.body.card).then((result) => {
	validatePostPaymentCardRequest(req.body.card)
		.then(() => addCardToUser(req.user, req.body.card))
		.then((result) => {
			res.json(result)
		}).catch((reason) => {
			next(handleError(reason, 'POST /user/payment-card'))
		})
})

router.put('/payment-card', (req, res, next) => {
	validateDeletePaymentCardRequest(req.body)
		.then(() => deleteCard(req.user, req.body.cardToken))
		.then((result) => {
			res.json(result)
		}).catch((reason) => {
			next(handleError(reason, 'PUT /user/payment-card'))
		})
})

router.get('/profile', (req, res, next) => {
	isUserExists(req.user.phoneNumber)
		.then((user) => {
			res.json(user)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /user/profile'))
		})
})

router.put('/profile', (req, res, next) => {
	validateUpdateProfileRequest(req.body)
		.then(() => updateUser(req.user._id, req.body))
		.then((user) => {
			res.json(user)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /user/profile'))
		})
})

router.post('/cart', (req, res, next) => {
	validateSaveCartRequest(req.body)
		.then(() => validateSaveCartProducts(req.body))
		.then(() => saveCart(req.user._id, req.body))
		.then((result) => {
			res.json(result)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/cart'))
		})
})

router.delete('/cart', (req, res, next) => {
	clearCart(req.user._id.toString()).then(() => {
		res.json()
	}).catch((reason) => {
		next(handleError(reason, 'DELETE /user/cart'))
	})
})

router.get('/cart', (req, res, next) => {
	getCart(req.user._id.toString()).then((cart) => {
		res.json({ cart })
	}).catch((reason) => {
		next(handleError(reason, 'GET /user/cart'))
	})
})

router.post('/address', (req, res, next) => {
	validateSaveAddressRequest(req.body)
		.then(() => saveAddressToDatabase(req.user._id, req.body))
		.then((user) => {
			res.json(user)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/address'))
		})
})

router.get('/orders', (req, res, next) => {
	getOrders(req.user.phoneNumber)
		.then((orders) => {
			res.json(orders)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /user/favorite-products'))
		})
})

router.get('/favorite-products', (req, res, next) => {
	getFavoriteProductsFromDatabase(req.user._id)
		.then((favoriteProducts) => {
			res.json(favoriteProducts[0])
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /user/favorite-products'))
		})
})

router.post('/favorite-product', (req, res, next) => {
	validateFavoriteProductRequest(req.body)
		.then(() => saveFavoriteProductToDatabase(req.user._id, req.body))
		.then(({ favoriteProducts }) => {
			res.json(favoriteProducts)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/favorite-product'))
		})
})

router.delete('/favorite-product/:_id', (req, res, next) => {
	validateFavoriteProductRequest(req.params)
		.then(() => removeFavoriteProductFromDatabase(req.user._id, req.params._id))
		.then(({ favoriteProducts }) => {
			res.json(favoriteProducts)
		})
		.catch((reason) => {
			next(handleError(reason, 'DELETE /user/favorite-product/:_id'))
		})
})

router.delete('/address/:_id', (req, res, next) => {
	deleteAddress(req.user._id, req.params._id)
		.then((user) => {
			res.json(user)
		})
		.catch((reason) => {
			next(handleError(reason, 'DELETE /user/address/:_id'))
		})
})

router.post('/order', (req, res, next) => {
	validateMakeOrderRequest(req.body)
		.then(() => checkMakeOrderValues(req.user, req.body))
		.then(({ cart, card, selectedAddress }) => completePayment(req.user, cart, selectedAddress.openAddress, card).then((result) => ({ cart, selectedAddress, result })))
		.then(({ cart, selectedAddress, result }) => saveOrderToDatabase(req.user, cart, selectedAddress).then((order) => ({ cart, order, result })))
		.then((orderResult) => updateProductsSoldTimes(orderResult.cart).then(() => orderResult))
		.then((orderResult) => clearCart(req.user._id.toString()).then(() => orderResult))
		.then((orderResult) => {
			res.json(orderResult)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/order'))
		})
})

router.put('/change-password', (req, res, next) => {
	validateChangePasswordRequest(req.body)
		.then(() => comparePasswords(req.user.password, req.body.oldPassword))
		.then(() => isUserExists(req.user.phoneNumber))
		.then((user) => changePassword(user, req.body.newPassword))
		.then(() => {
			res.json()
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /user/change-password'))
		})
})

router.get('/order/:_id', (req, res, next) => {
	getOrderById(req.params._id)
		.then((order) => {
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /user/order/:_id'))
		})
})

router.post('/save-comment', (req, res, next) => {
	validateSaveComment(req.body)
		.then(() => saveComment(req.user, req.body))
		.then((variables) => {
			res.json(variables.comments)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /user/save-comment'))
		})
})

export default router