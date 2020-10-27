import mongoose from 'mongoose'
import HttpStatusCodes from 'http-status-codes'
import ErrorMessages from '../errors/ErrorMessages'
import ServerError from '../errors/ServerError'
import Iyzipay from 'iyzipay'

import PaymentProvider from './payment-provider'
import {
	User, Order,
	UserDocument,
	ProductDocument,
	Product,
	ProductVariables,
	Comment
} from '../models'
import Cart from '../models/Cart'
import OrderStatus from '../enums/order-status-enum'

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
				[product._id.toString()]: Object.assign(product.toObject(), { quantity: body[index].quantity, paidPrice: product.discountedPrice ?? product.price })
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
	const selectedAddress = user.addresses.find((address) => address._id.toString() === context.address)

	return Cart.findOne({ userId: user._id.toString() }).then((cartObj) => {
		if (!cartObj || !(cartObj.cart.length > 0)) {
			throw new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, ErrorMessages.EMPTY_CART, false)
		} else if (!selectedAddress) {
			throw new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NO_ADDRESS, false)
		} else {
			return createCart(cartObj.cart).then((cart) => {
				return ({ cart, selectedAddress, card: context.card })
			})
		}
	})
}

export const saveOrderToDatabase = (user: UserDocument, cart: any, address: any) => {
	const paidPrice = Object.values(cart).reduce((previousValue: number, currentValue: any) => previousValue + parseFloat(currentValue.discountedPrice || currentValue.price) * currentValue.quantity, 0) as number

	return new Order({
		customer: user.nameSurname,
		phoneNumber: user.phoneNumber,
		address: address.openAddress,
		products: Object.values(cart),
		paidPrice: paidPrice.toFixed(2),
		cargoPrice: paidPrice < 85 ? 15 : 0
	}).save()
}

export const updateProductsSoldTimes = (cart: any) => {
	const updates = Object.values(cart).map((cartProduct: any) => (
		ProductVariables.findOneAndUpdate({ productId: cartProduct._id }, { $inc: { timesSold: cartProduct.quantity } })
	))

	return Promise.all(updates)
}

export const saveAddressToDatabase = (userId: string, address: any) => (
	User.findByIdAndUpdate(userId, {
		$push: {
			addresses: address
		}
	}, { new: true })
)

export const getOrders = (phoneNumber: string) => (
	Order.aggregate([
		{
			$match: {
				phoneNumber
			}
		},
		{
			$unwind: {
				path: '$returnItems',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$addFields: {
				returnQuantity: '$returnItems.quantity'
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				localField: 'returnItems._id',
				foreignField: '_id',
				as: 'returnItems'
			}
		},
		{
			$addFields: {
				returnItems: {
					$arrayElemAt: ['$returnItems', 0]
				}
			}
		},
		{
			$addFields: {
				currentProduct: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$eq: ['$$product._id', '$returnItems._id']
						}
					}
				}
			}
		},
		{
			$addFields: {
				currentProduct: {
					$arrayElemAt: ['$currentProduct', 0]
				}
			}
		},
		{
			$addFields: {
				returnItems: {
					quantity: '$returnQuantity',
					paidPrice: '$currentProduct.paidPrice'
				}
			}
		},
		{
			$group: {
				_id: '$_id',
				status: { $first: '$status' },
				date: { $first: '$date' },
				message: { $first: '$message' },
				paidPrice: { $first: '$paidPrice' },
				cargoPrice: { $first: '$cargoPrice' },
				products: { $first: '$products' },
				returnItemsTotalPayback: {
					$sum: {
						$multiply: ['$returnItems.paidPrice', '$returnItems.quantity']
					}
				},
				returnItems: {
					$push: '$returnItems'
				}
			}
		},
		{
			$addFields: {
				returnItems: {
					$filter: {
						input: '$returnItems',
						as: 'returnItem',
						cond: {
							$gt: ['$$returnItem._id', null]
						}
					}
				}
			}
		},
		{
			$sort: {
				_id: -1
			}
		}
	])
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
		PaymentProvider.getClient().card.create({
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
		PaymentProvider.getClient().card.create({
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
		PaymentProvider.getClient().card.delete({
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
		PaymentProvider.getClient().cardList.retrieve({
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

export const createPaymentWithRegisteredCard = (user: UserDocument, price: number, cargoPrice: number, basketItems: any[], address: string, cardToken: string) => (
	new Promise((resolve, reject) => {
		const request = {
			locale: Iyzipay.LOCALE.TR,
			// conversationId: '123456789',
			price: price.toFixed(2),
			paidPrice: (price + cargoPrice).toFixed(2),
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

		PaymentProvider.getClient().payment.create(request, (error: any, result: any) => {
			if (error) {
				reject(error)
			} if (result.status === 'failure') {
				reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
			}
			resolve(result)
		})
	})
)


export const completePayment = (user: UserDocument, cart: any, address: string, cardToken: string) => {
	const paidPrice = Object.values(cart).reduce((previousValue: number, currentValue: any) => previousValue + (currentValue.price * currentValue.quantity), 0) as number
	const cargoPrice = paidPrice < 85 ? 15 : 0

	return createPaymentWithRegisteredCard(
		user,
		paidPrice,
		cargoPrice,
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
}

export const getOrderById = (orderId: string) => (
	Order.aggregate([
		{
			$match: {
				_id: mongoose.Types.ObjectId(orderId)
			}
		},
		{
			$unwind: {
				path: '$returnItems',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$addFields: {
				returnQuantity: '$returnItems.quantity'
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				localField: 'returnItems._id',
				foreignField: '_id',
				as: 'returnItems'
			}
		},
		{
			$addFields: {
				returnItems: {
					$arrayElemAt: ['$returnItems', 0]
				}
			}
		},
		{
			$addFields: {
				currentProduct: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$eq: ['$$product._id', '$returnItems._id']
						}
					}
				}
			}
		},
		{
			$addFields: {
				currentProduct: {
					$arrayElemAt: ['$currentProduct', 0]
				}
			}
		},
		{
			$addFields: {
				returnItems: {
					quantity: '$returnQuantity',
					paidPrice: '$currentProduct.paidPrice'
				}
			}
		},
		{
			$group: {
				_id: '$_id',
				status: { $first: '$status' },
				date: { $first: '$date' },
				customer: { $first: '$customer' },
				address: { $first: '$address' },
				message: { $first: '$message' },
				paidPrice: { $first: '$paidPrice' },
				cargoPrice: { $first: '$cargoPrice' },
				products: { $first: '$products' },
				returnItemsTotalPayback: {
					$sum: {
						$multiply: ['$returnItems.paidPrice', '$returnItems.quantity']
					}
				},
				returnItems: {
					$push: '$returnItems'
				}
			}
		},
		{
			$addFields: {
				returnItems: {
					$filter: {
						input: '$returnItems',
						as: 'returnItem',
						cond: {
							$gt: ['$$returnItem._id', null]
						}
					}
				}
			}
		},
		{
			$sort: {
				_id: -1
			}
		}
	])
)

export const returnItems = (orderId: string, returnItems: any[]) => (
	Order.findByIdAndUpdate(orderId, { returnItems, status: OrderStatus.RETURNED }, { new: true })
)

export const updatePhoneNumber = (oldPhoneNumber: string, newPhoneNumber: string) => (
	User.findOneAndUpdate({ phoneNumber: oldPhoneNumber }, { phoneNumber: newPhoneNumber }, { new: true })
)

export const saveComment = (user: UserDocument, body: {
	ownerAlias?: string,
	productId: string,
	comment: string,
	title: string,
	generalRate: number,
	qualityRate: number,
	priceRate: number
}) => {
	if (body.ownerAlias) {
		return User.findByIdAndUpdate(user._id, { alias: body.ownerAlias }).then(() => {
			return new Comment({
				productId: body.productId,
				ownerId: user._id,
				ownerAlias: body.ownerAlias,
				title: body.title,
				comment: body.comment,
				generalRate: body.generalRate,
				qualityRate: body.qualityRate,
				priceRate: body.priceRate
			}).save()
		})
	} else {
		return new Comment({
			productId: body.productId,
			ownerId: user._id,
			ownerAlias: user.alias,
			title: body.title,
			comment: body.comment,
			generalRate: body.generalRate,
			qualityRate: body.qualityRate,
			priceRate: body.priceRate
		}).save()
	}
}

export const likeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$addToSet: {
			likes: user._id
		},
		$pull: {
			dislikes: user._id
		}
	}, { new: true })
)

export const removeLikeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$pull: {
			likes: user._id
		}
	}, { new: true })
)

export const dislikeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$addToSet: {
			dislikes: user._id
		},
		$pull: {
			likes: user._id
		}
	}, { new: true })
)

export const removeDislikeComment = (user: UserDocument, commentId: string) => (
	Comment.findByIdAndUpdate(commentId, {
		$pull: {
			dislikes: user._id
		}
	}, { new: true })
)