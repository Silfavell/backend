import HttpStatusCodes from 'http-status-codes'
import Iyzipay from 'iyzipay'

import ErrorMessages from '../errors/ErrorMessages'
import ServerError from '../errors/ServerError'

import {
	User, Order,
	// eslint-disable-next-line no-unused-vars
	UserDocument,
	ProductDocument,
	Product
} from '../models'
import Cart from '../models/Cart'

const iyzipay = new Iyzipay({
	apiKey: 'sandbox-hbjzTU7CZDxarIUKVMhWLvHOIMIb3Z40',
	secretKey: 'sandbox-F01xQT4VMHAdFDB4RFNgo2l0kMImhCPX',
	uri: 'https://sandbox-api.iyzipay.com'
})

export const updateUser = (userId: string, userContext: any) => (
	User.findByIdAndUpdate(userId, userContext, { new: true })
)

export const validateSaveCartProducts = (body: any) => (
	new Promise((resolve, reject) => {
		const productIds = body.map((product: any) => product._id)
		const regex = new RegExp('^[0-9a-fA-F]{24}$')

		if (productIds.every((productId: any) => regex.test(productId))) {
			resolve()
		}

		reject(new ServerError(ErrorMessages.UNKNOWN_OBJECT_ID, HttpStatusCodes.BAD_REQUEST, ErrorMessages.UNKNOWN_OBJECT_ID, false))
	})
)

export const createCart = (body: { _id: string, quantity: number }[]) => {
	const productIds = body.map((product) => product._id)

	return Product.find().where('_id').in(productIds).then((products: ProductDocument[]) => (
		products.reduce((json, product, index) => {
			if (!product) {
				throw new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false)
			}

			return Object.assign(json, {
				// eslint-disable-next-line security/detect-object-injection
				[product._id.toString()]: Object.assign(product.toObject(), { quantity: body[index].quantity })
			})
		}, {})
	))
}

export const saveCart = (userId: string, cart: ProductDocument[]) => (
	new Promise((resolve) => {
		Cart.findOne({ userId }).then((cartObj) => {
			if (cartObj) {
				cartObj.update({ cart }).then((res) => {
					resolve(res)
				})
			} else {
				new Cart({ userId, cart }).save().then((res) => {
					resolve(res)
				})
			}
		})
	})
)

export const getCart = (userId: string) => (
	Cart.findOne({ userId }).then((cart) => {
		if (cart) {
			return createCart(cart.cart).then((cartObj) => (
				cartObj
			))
		} else {
			return {}
		}
	})
)

export const clearCart = (userId: string) => (
	Cart.deleteOne({ userId })
)

export const deleteAddress = (userId: string, deletedAddressId: string) => (
	User.findByIdAndUpdate(userId, {
		$pull: {
			addresses: {
				_id: deletedAddressId
			}
		}
	}, { new: true })
)

export const checkMakeOrderValues = (user: UserDocument, context: any) => {
	// @ts-ignore
	const selectedAddress = user.addresses.find((address) => address._id.toString() === context.address)

	// @ts-ignore
	return Cart.findOne({ userId: user._id.toString() }).then((cartObj) => {
		if (!cartObj || !cartObj.cart) {
			throw new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, null, false)
		} else if (!selectedAddress) {
			throw new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, null, false)
		} else {
			return createCart(cartObj.cart).then((cart) => {
				return ({ cart, selectedAddress, card: context.card })
			})
		}
	})
}

export const saveOrderToDatabase = (user: UserDocument, cart: any, address: any) => (
	new Order({
		customer: user.nameSurname,
		phoneNumber: user.phoneNumber,
		address: address.openAddress,
		products: Object.values(cart),
		// @ts-ignore
		paidPrice: Object.values(cart).reduce((previousValue: number, currentValue: any) => previousValue + parseFloat(currentValue.discountedPrice || currentValue.price) * currentValue.quantity, 0).toFixed(2)
	}).save()
)

export const saveAddressToDatabase = (userId: string, address: any) => (
	User.findByIdAndUpdate(userId, {
		$push: {
			addresses: address
		}
	}, { new: true })
)

export const getOrders = (phoneNumber: string) => (
	Order.find({ phoneNumber })
)

export const getFavoriteProductsFromDatabase = (userId: string) => (
	User.aggregate([
		{
			$match: {
				_id: userId
			}
		},
		{
			$project: {
				favoriteProducts: 1
			}
		},
		{
			$unwind: '$favoriteProducts'
		},
		{
			$project: {
				favoriteProducts: {
					$toObjectId: '$favoriteProducts'
				}
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				localField: 'favoriteProducts',
				foreignField: '_id',
				as: 'favoriteProducts'
			}
		},
		{
			$unwind: '$favoriteProducts'
		},
		{
			$group: {
				_id: '$_id',
				favoriteProducts: {
					$push: '$favoriteProducts'
				}
			}
		}
	])
)

export const saveFavoriteProductToDatabase = (userId: string, { _id }: any) => (
	User.findByIdAndUpdate(userId, {
		$addToSet: {
			favoriteProducts: _id
		}
	}, {
		new: true,
		fields: { favoriteProducts: 1 }
	})
)

export const removeFavoriteProductFromDatabase = (userId: string, _id: string) => (
	User.findByIdAndUpdate(userId, {
		$pull: {
			favoriteProducts: _id
		}
	}, {
		new: true,
		fields: { favoriteProducts: 1 }
	})
)

export const createPaymentUserWithCard = (user: UserDocument, card: any) => (
	new Promise((resolve, reject) => {
		iyzipay.card.create({
			locale: Iyzipay.LOCALE.TR,
			email: user.email,
			gsmNumber: user.phoneNumber,
			card
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const addNewCard = (cardUserKey: string, card: any) => (
	new Promise((resolve, reject) => {
		iyzipay.card.create({
			locale: Iyzipay.LOCALE.TR,
			cardUserKey,
			card
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const addCardToUser = (user: UserDocument, card: any) => {
	if (!user.cardUserKey) {
		return createPaymentUserWithCard(user, card)
			.then((result: any) => updateUser(user._id, { cardUserKey: result.cardUserKey }).then(() => result))
	}
	return addNewCard(user.cardUserKey, card)
}

export const deleteCard = (user: UserDocument, cardToken: string) => (
	new Promise((resolve, reject) => {
		iyzipay.card.delete({
			locale: Iyzipay.LOCALE.TR,
			cardUserKey: user.cardUserKey,
			cardToken
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const listCards = (cardUserKey: string) => (
	new Promise((resolve, reject) => {
		if (!cardUserKey) {
			resolve([])
		}
		iyzipay.cardList.retrieve({
			locale: Iyzipay.LOCALE.TR,
			cardUserKey
		}, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)

export const createPaymentWithRegisteredCard = (user: UserDocument, price: number, basketItems: any[], address: string, cardToken: string) => (
	new Promise((resolve, reject) => {
		const request = {
			locale: Iyzipay.LOCALE.TR,
			// conversationId: '123456789',
			price: price.toString(),
			paidPrice: price.toString(),
			currency: Iyzipay.CURRENCY.TRY,
			installment: '1',
			basketId: 'B67832',
			paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
			paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
			paymentCard: {
				cardUserKey: user.cardUserKey,
				cardToken
			},
			buyer: {
				id: user._id.toString(),
				name: user.nameSurname,
				surname: user.nameSurname,
				gsmNumber: user.phoneNumber,
				email: user.email,
				identityNumber: '11111111111',
				//	lastLoginDate: '2020-04-15 10:12:35',
				//	registrationDate: '2020-04-15 10:12:09',
				registrationAddress: address,
				// ip: '85.34.78.112',
				city: 'Istanbul',
				country: 'Turkey',
				// zipCode: '34732'
			},
			shippingAddress: {
				contactName: user.nameSurname,
				city: 'Istanbul',
				country: 'Turkey',
				address,
				// zipCode: '34742'
			},
			billingAddress: {
				contactName: user.nameSurname,
				city: 'Istanbul',
				country: 'Turkey',
				address,
				// zipCode: '34742'
			},
			basketItems
		}

		iyzipay.payment.create(request, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)


export const completePayment = (user: UserDocument, cart: any, address: string, cardToken: string) => (
	createPaymentWithRegisteredCard(
		user,
		// @ts-ignore
		Object.values(cart).reduce((previousValue: number, currentValue: any) => previousValue + (currentValue.price * currentValue.quantity), 0).toFixed(2),
		Object.values(cart).map(({
			_id,
			name,
			price,
			quantity
		}) => ({
			id: _id.toString(),
			name,
			price: (price * quantity).toFixed(2).toString(),
			category1: 'product',
			itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL
		})),
		address,
		cardToken
	)
)