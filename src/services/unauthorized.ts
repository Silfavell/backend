import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'
import Nexmo from 'nexmo'

import { Elasticsearch } from '../startup'
import ServerError from '../errors/ServerError'
import {
	User,
	Manager,
	// eslint-disable-next-line no-unused-vars
	UserDocument,
	// eslint-disable-next-line no-unused-vars
	ManagerDocument,
	// eslint-disable-next-line no-unused-vars
	ProductDocument,
	// eslint-disable-next-line no-unused-vars
	AdminDocument,
	// eslint-disable-next-line no-unused-vars
	CategoryDocument,
	Category,
	Product
} from '../models'
import ErrorMessages from '../errors/ErrorMessages'
import ActivationCodes from '../enums/activation-code-enum'

import {
	comparePasswords,
	isUserNonExists,
	isUserExists,
	isManagerNonExists,
	isManagerExists
} from '../validators'
import ActivationCode from '../models/ActivationCode'
// eslint-disable-next-line no-unused-vars
import Cart from '../models/Cart'
import ProductSort from '../enums/product-sort-enum'

export const sendSms = (to: string, message: string) => {
	const smsManager: any = new Nexmo({
		apiKey: '14efe668',
		apiSecret: 'ivcyJQr7tWmvT4yP',
	})

	const from = 'Platform App'

	smsManager.message.sendSms(from, to, message)
}

export const getCategories = () => (
	Category.find()
)

export const getProductsWithCategories = () => (
	Category.aggregate([
		{
			$unwind: '$subCategories'
		},
		{
			$project: {
				name: 1,
				subCategoryName: {
					$toString: '$subCategories.name'
				},
				subCategoryId: {
					$toString: '$subCategories._id'
				}
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				localField: 'subCategoryId',
				foreignField: 'subCategoryId',
				as: 'products'
			}
		},
		{
			$project: {
				products: {
					categoryId: 0,
					subCategoryId: 0,
					__v: 0
				}
			}
		},
		{
			$group: {
				_id: '$_id',
				name: { $first: '$name' },
				subCategories: {
					$push: {
						name: '$subCategoryName',
						_id: '$subCategoryId',
						products: '$products'
					}
				}
			}
		}
	])
)

export const getProductsLength = (query: any) => {
	// eslint-disable-next-line no-param-reassign
	delete query.sortType
	// eslint-disable-next-line no-param-reassign
	delete query.start
	// eslint-disable-next-line no-param-reassign
	delete query.quantity

	if (query.brands) {
		const brandList = query.brands.split(',')
		// eslint-disable-next-line no-param-reassign
		delete query.brands
		return Product
			.where('brand')
			.in(brandList)
			.countDocuments(query)
	}
	return Product.countDocuments(query)
}

export const getFilteredProducts = (query: any) => {
	const criteria = {}

	if (query.categoryId) {
		// @ts-ignore
		criteria.categoryId = query.categoryId
	}

	if (query.subCategoryId) {
		// @ts-ignore
		criteria.subCategoryId = query.subCategoryId
	}

	let product = Product.find(criteria)

	if (query.start) {
		// eslint-disable-next-line radix
		const start = parseInt(query.start)
		product.skip(start)
	}

	if (query.quantity) {
		// eslint-disable-next-line radix
		const quantity = parseInt(query.quantity)
		product.limit(quantity)
	}

	// eslint-disable-next-line radix
	if (parseInt(query.sortType) !== ProductSort.CLASSIC) {
		// eslint-disable-next-line radix
		switch (parseInt(query.sortType)) {
			case ProductSort.MIN_PRICE: {
				product = product.sort({ price: 1 })
				break
			}

			case ProductSort.MAX_PRICE: {
				product = product.sort({ price: -1 })
				break
			}

			default: break
		}
	}

	if (query.brands) {
		product = product.where('brand').in(query.brands.split(','))
	}

	if (query.productIds) {
		product = product.where('_id').in(query.productIds.split(','))
	}

	return product
}

export const getProductsByRange = (categoryId: string, start: string, quantity: string) => (
	// eslint-disable-next-line radix
	Product.find({ categoryId }).skip(parseInt(start)).limit(parseInt(quantity))
)

export const validateObjectId = (productId: string) => (
	new Promise((resolve, reject) => {
		const test = new RegExp('^[0-9a-fA-F]{24}$').test(productId)

		if (test) {
			resolve()
		}
		reject(new ServerError(ErrorMessages.UNKNOWN_OBJECT_ID, HttpStatusCodes.BAD_REQUEST, ErrorMessages.UNKNOWN_OBJECT_ID, false))
	})
)

export const getSingleProduct = (productId: string, user: UserDocument) => (
	Product.findById(productId).then((product) => {
		if (product) {
			return Cart.findOne({ userId: user?._id?.toString() }).then((cart) => {
				if (cart) {
					return {
						product,
						cart
					}
				}
				return {
					product
				}
			})
		}
		throw new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false)
	})
)

export const addProductToCart = (product: any, cartObj: any, user: UserDocument) => (
	new Promise((resolve) => {
		// @ts-ignore
		if (user?._id.toString()) {
			if (cartObj && cartObj.cart) {
				if (Object.keys(cartObj.cart).includes(product._id.toString())) {
					Cart.findOneAndUpdate({ userId: user._id.toString() }, {
						cart: {
							...cartObj.cart,
							[product._id.toString()]: Object.assign(product._doc, {
								quantity: (cartObj.cart[product._id.toString()].quantity ?? 1) + 1
							})
						}
					}).then(() => {
						resolve(Object.assign(product._doc, { quantity: (cartObj.cart[product._id.toString()].quantity ?? 1) + 1 }))
					})
				} else {
					Cart.findOneAndUpdate({ userId: user._id.toString() }, {
						cart: {
							...cartObj.cart,
							[product._id.toString()]: Object.assign(product._doc, { quantity: 1 })
						}
					}).then(() => {
						resolve(Object.assign(product._doc, { quantity: 1 }))
					})
				}
			} else {
				new Cart({
					userId: user._id.toString(),
					cart: {
						[product._id.toString()]: Object.assign(product._doc, { quantity: 1 })
					}
				}).save().then(() => {
					resolve(Object.assign(product._doc, { quantity: 1 }))
				})
			}
		} else {
			resolve(product)
		}
	})
)

export const takeOffProductFromCart = (product: any, cartObj: any, user: UserDocument) => (
	new Promise((resolve, reject) => {
		if (user?._id.toString()) {
			if (cartObj && cartObj.cart) {
				if (Object.keys(cartObj.cart).includes(product._id.toString())) {
					if (cartObj.cart[product._id.toString()].quantity > 1) {
						Cart.findOneAndUpdate({ userId: user._id.toString() },
							{
								cart: Object.assign(
									cartObj.cart,
									{
										[product._id.toString()]: Object.assign(product._doc, { quantity: (cartObj.cart[product._id.toString()].quantity) - 1 })
									}
								)
							})
							.then(() => {
								resolve(Object.assign(product._doc, { quantity: (cartObj.cart[product._id.toString()].quantity) }))
							})
					} else if (cartObj.cart[product._id.toString()].quantity === 1) {
						// eslint-disable-next-line no-shadow
						Cart.findOne({ userId: user._id.toString() }).then((cartObj2: any) => {
							// eslint-disable-next-line no-param-reassign
							delete cartObj2.cart[product._id.toString()]
							cartObj2.update({
								cart: cartObj2.cart
							}).then(() => {
								resolve(Object.assign(product._doc, { quantity: 0 }))
							})
						})
					} else {
						reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false))
					}
				} else {
					reject(new ServerError(ErrorMessages.NON_EXISTS_PRODUCT_IN_CART, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT_IN_CART, false))
				}
			} else {
				reject(new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, ErrorMessages.EMPTY_CART, false))
			}
		} else {
			resolve(product)
		}
	})
)

export const search = (name: string) => (
	Elasticsearch.getClient.search({
		index: 'doc',
		type: 'doc',
		body: {
			query: {
				bool: {
					must: [
						// {
						// 	geo_distance: {
						// 		distance: '1km',
						// 		'geometry.location': location
						// 	}
						// },
						{
							match_phrase_prefix: {
								name
							}
						}
					]
				}
			}
		}
	})
)

export const checkConvenientOfActivationCodeRequest = (phoneNumber: string, activationCodeType: ActivationCodes): Promise<UserDocument | ManagerDocument | void> => {
	switch (activationCodeType) {
		case ActivationCodes.REGISTER_USER: return isUserNonExists(phoneNumber)

		case ActivationCodes.RESET_PASSWORD: return isUserExists(phoneNumber)

		case ActivationCodes.REGISTER_MANAGER: return isManagerNonExists(phoneNumber)

		case ActivationCodes.RESET_MANAGER_PASSWORD: return isManagerExists(phoneNumber)

		default: throw new ServerError(ErrorMessages.UNKNOWN_TYPE_OF_ACTIVATION_CODE, HttpStatusCodes.BAD_REQUEST, null, false)
	}
}

export const createActivationCode = (phoneNumber: string, activationCodeType: ActivationCodes) => {
	const activationCode = parseInt(Math.floor(1000 + Math.random() * 9000).toString(), 10)
	console.log(activationCode, activationCodeType)

	return ActivationCode.findOneAndDelete({
		userPhoneNumber: phoneNumber,
		activationCodeType
	}).then(() => (
		new ActivationCode({
			userPhoneNumber: phoneNumber,
			activationCodeType,
			activationCode
		}).save().then(() => activationCode)
	))
}

export const sendActivationCode = (phoneNumber: string, activationCode: number) => (
	new Promise((resolve) => {
		sendSms(`9${phoneNumber.split(' ').join('')}`, `Onay kodu: ${activationCode}`)
		resolve()
	})
)

export const login = (user: any, password: string) => (
	comparePasswords(user.password, password).then(() => user)
)

export const isManagerVerified = (manager: ManagerDocument) => (
	new Promise((resolve, reject) => {
		if (!manager.verified) {
			reject(new ServerError(ErrorMessages.MANAGER_IS_NOT_VERIFIED, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.MANAGER_IS_NOT_VERIFIED, true))
		} else {
			resolve()
		}
	})
)

export const registerUser = (userContext: any) => (
	new User(userContext).save().then((user) => (
		ActivationCode.deleteOne({
			userPhoneNumber: user.phoneNumber,
			activationCodeType: ActivationCodes.REGISTER_USER
		}).then(() => user)
	))
)

export const registerManager = (managerContext: any) => (
	new Manager(managerContext).save().then((manager) => (
		ActivationCode.deleteOne({
			userPhoneNumber: manager.phoneNumber,
			activationCodeType: ActivationCodes.REGISTER_MANAGER
		}).then(() => manager)
	))
)

export const createToken = (context: UserDocument | ManagerDocument | AdminDocument): Promise<string> => (
	new Promise((resolve, reject) => {
		jwt.sign({ payload: context }, process.env.SECRET, (jwtErr: Error, token: string) => {
			if (jwtErr) {
				reject(jwtErr)
			} else {
				resolve(token)
			}
		})
	})
)

export const changePassword = (user: UserDocument, newPassword: string) => {
	// eslint-disable-next-line no-param-reassign
	user.password = newPassword
	return user.save().then(() => (
		ActivationCode.deleteOne({
			userPhoneNumber: user.phoneNumber,
			activationCodeType: ActivationCodes.RESET_PASSWORD
		})
	))
}

export const handleError = (error: any, path: string): Error => {
	if (error.httpCode) {
		return error
	}
	if (error.isJoi) {
		return new ServerError(error.message, HttpStatusCodes.BAD_REQUEST, path, false)
	}
	return new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, path, true)
}