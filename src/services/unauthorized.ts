import mongoose from 'mongoose'
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
	Product,
	Ticket
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
import Cart, { CartDocument } from '../models/Cart'
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
				brands: 1,
				imagePath: 1,
				subCategoryName: {
					$toString: '$subCategories.name'
				},
				subCategoryId: {
					$toString: '$subCategories._id'
				},
				subCategoryBrands: '$subCategories.brands'
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
					subCategoryId: 0,
					__v: 0
				}
			}
		},
		{
			$match: {
				'products.0': { $exists: true }
			}
		},
		{
			$group: {
				_id: '$_id',
				name: { $first: '$name' },
				imagePath: { $first: '$imagePath' },
				brands: { $first: '$brands' },
				subCategories: {
					$push: {
						name: '$subCategoryName',
						_id: '$subCategoryId',
						products: '$products'
					}
				}
			}
		},
		{
			$sort: {
				imagePath: 1
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

export const getFilteredProductsWithCategories = (query: any) => {
	const match = [
		{
			$eq: ['$categoryId', query.categoryId]
		},
		{
			$eq: ['$subCategoryId', '$$subCategoryId']
		}
	]

	if (query.brands) {
		match.push({
			// @ts-ignore
			$in: ['$brand', query.brands.split(',')]
		})
	}

	const pipeline = [
		{
			$match: {
				$expr: {
					$and: match
				}
			}
		}
	]

	if (query.sortType) {
		switch (parseInt(query.sortType)) {
			case ProductSort.MIN_PRICE: {
				pipeline.push({
					// @ts-ignore
					$sort: { price: 1 }
				})
				break
			}

			case ProductSort.MAX_PRICE: {
				pipeline.push({
					// @ts-ignore
					$sort: { price: -1 }
				})
				break
			}

			default: break
		}
	}

	return Category.aggregate([
		{
			$unwind: '$subCategories'
		},
		{
			$project: {
				name: 1,
				imagePath: 1,
				subCategoryName: {
					$toString: '$subCategories.name'
				},
				subCategoryId: {
					$toString: '$subCategories._id'
				},
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				//	localField: 'subCategoryId',
				//	foreignField: 'subCategoryId',
				let: { subCategoryId: '$subCategoryId' },
				as: 'products',
				pipeline
			}
		},
		{
			$project: {
				products: {
					subCategoryId: 0,
					__v: 0
				}
			}
		},
		{
			$match: {
				'products.0': { $exists: true }
			}
		},
		{
			$group: {
				_id: '$_id',
				name: { $first: '$name' },
				imagePath: { $first: '$imagePath' },
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
}

export const getFilteredProducts = (query: any, params: any) => {
	const stages = []

	if (params.category) {
		if (params.subCategory) {
			stages.push(
				{
					$lookup: {
						from: Category.collection.name,
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{
												$eq: [params.category, '$slug']
											}
										]
									}
								}
							}
						],
						as: 'category'
					}
				},
				{
					$project: {
						root: '$$ROOT',
						categoryId: {
							$toObjectId: '$categoryId'
						},
						subCategoryId: {
							$toObjectId: '$subCategoryId'
						},
						category: { $arrayElemAt: ['$category', 0] }
					}
				},
				{
					$project: {
						root: 1,
						categoryId: 1,
						subCategoryId: 1,
						category: {
							_id: 1,
							subCategories: {
								$filter: {
									input: '$category.subCategories',
									as: 'subCategory',
									cond: {
										$eq: ['$$subCategory.slug', params.subCategory]
									}
								}
							}
						}
					}
				},
				{
					$project: {
						root: 1,
						categoryId: 1,
						subCategoryId: 1,
						category: {
							_id: 1,
							subCategory: {
								$arrayElemAt: ['$category.subCategories', 0]
							}
						}
					}
				},
				{
					$match: {
						$expr: {
							$and: [
								{
									$eq: ['$category._id', '$categoryId']
								},
								{
									$eq: ['$category.subCategory._id', '$subCategoryId']
								}
							]
						}
					}
				},
				{
					$replaceRoot: {
						newRoot: '$root'
					}
				},
				{
					$project: {
						category: 0
					}
				}
			)
		} else {
			stages.push(
				{
					$lookup: {
						from: Category.collection.name,
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{
												$eq: [params.category, '$slug']
											}
										]
									}
								}
							}
						],
						as: 'category'
					}
				},
				{
					$project: {
						root: '$$ROOT',
						categoryId: {
							$toObjectId: '$categoryId'
						},
						category: { $arrayElemAt: ['$category', 0] }
					}
				},
				{
					$match: {
						$expr: {
							$eq: ['$category._id', '$categoryId']
						}
					}
				},
				{
					$replaceRoot: {
						newRoot: '$root'
					}
				},
				{
					$project: {
						category: 0
					}
				}
			)
		}
	}

	if (query.categoryId) {
		stages.push({
			$match: {
				categoryId: query.categoryId
			}
		})
	}

	if (query.subCategoryId) {
		stages.push({
			$match: {
				subCategoryId: query.subCategoryId
			}
		})
	}

	if (query.brands) {
		stages.push({
			$match: {
				brand: {
					$in: query.brands.split(',')
				}
			}
		})
	}

	if (query.productIds) {
		stages.push({
			$match: {
				_id: {
					$in: query.productIds.split(',').map((productId: any) => mongoose.Types.ObjectId(productId))
				}
			}
		})
	}

	if (query.start) {
		stages.push({
			$skip: parseInt(query.start)
		})
	}

	if (query.quantity) {
		stages.push({
			$limit: parseInt(query.quantity)
		})
	}

	if (query.sortType) {
		switch (parseInt(query.sortType)) {
			case ProductSort.MIN_PRICE: {
				stages.push({
					$sort: {
						price: -1
					}
				})
				break
			}

			case ProductSort.MAX_PRICE: {
				stages.push({
					$sort: {
						price: 1
					}
				})
				break
			}

			default: break
		}
	}

	return Product.aggregate(stages)
}

export const getProductsByRange = (categoryId: string, start: string, quantity: string) => (
	// eslint-disable-next-line radix
	Product.find({ categoryId }).skip(parseInt(start)).limit(parseInt(quantity))
)

export const validateObjectId = (objectId: string) => (
	new Promise((resolve, reject) => {
		const test = new RegExp('^[0-9a-fA-F]{24}$').test(objectId)

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

export const getProductAndWithColorGroup = (slug: string) => (
	Product.aggregate([
		{
			$match: {
				slug
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				localField: 'colorGroup',
				foreignField: 'colorGroup',
				as: 'group'
			}
		},
		{
			$unwind: '$group'
		},
		{
			$match: {
				$or: [
					{
						'group.color': {
							$ne: null
						}
					},
					{
						'group.slug': { // TODO Test
							$eq: slug
						}
					}
				]
			}
		},
		{
			$group: {
				_id: '$_id',
				root: { $first: '$$ROOT' },
				group: {
					$push: '$group'
				}
			}
		},
		{
			$addFields: {
				'root.group': '$group'
			}
		},
		{
			$replaceRoot: {
				newRoot: {
					$mergeObjects: [
						{
							group: '$groups'
						}, '$root'
					]
				}
			}
		}
	])
)

export const addProductToCart = (product: ProductDocument, cartObj: CartDocument, user: UserDocument, quantity: number) => (
	new Promise((resolve) => {
		// @ts-ignore
		if (user?._id.toString()) {
			if (cartObj && cartObj.cart) {
				const foundCartProduct = cartObj.cart.find((cartProduct => cartProduct._id === product._id.toString()))

				if (foundCartProduct) {
					foundCartProduct.quantity += quantity

					cartObj.save().then(() => {
						resolve(Object.assign(product.toObject(), { quantity: foundCartProduct.quantity }))
					})
				} else {
					Cart.findOneAndUpdate({ userId: user._id.toString() }, {
						$push: {
							cart: {
								_id: product._id.toString(),
								quantity
							}
						}
					}, { new: true }).then(() => {
						resolve(Object.assign(product.toObject(), { quantity }))
					})
				}
			} else {
				new Cart({
					userId: user._id.toString(),
					cart: [{
						_id: product._id.toString(),
						quantity
					}]
				}).save().then((x) => {
					resolve(Object.assign(product.toObject(), { quantity }))
				})
			}
		} else {
			resolve(product)
		}
	})
)

export const setProductToCart = (product: ProductDocument, cartObj: CartDocument, user: UserDocument, quantity: number) => (
	new Promise((resolve) => {
		// @ts-ignore
		if (user?._id.toString()) {
			if (quantity === 0) {
				Cart.findOneAndUpdate({ userId: user._id.toString() }, {
					$pull: {
						cart: {
							_id: product._id
						}
					}
				}, { new: true }).then(() => {
					resolve(product)
				})
			} else {
				const foundProduct = cartObj.cart.find((cartProduct) => cartProduct._id.toString() === product._id.toString())
				if (foundProduct) {
					foundProduct.quantity = quantity
				} else {
					cartObj.cart.push({
						_id: product._id,
						quantity
					})
				}

				cartObj.save().then(() => {
					resolve(Object.assign(product.toObject(), { quantity }))
				})
			}
		} else {
			resolve(product)
		}
	})
)

export const takeOffProductFromCart = (product: ProductDocument, cartObj: CartDocument, user: UserDocument, quantity: number) => (
	new Promise((resolve, reject) => {
		if (user?._id.toString()) {
			if (cartObj && cartObj.cart) {
				const foundCartProduct = cartObj.cart.find((cartProduct => cartProduct._id === product._id.toString()))

				if (foundCartProduct) {
					if (foundCartProduct.quantity > quantity) {
						foundCartProduct.quantity -= quantity

						cartObj.save().then(() => {
							resolve(Object.assign(product.toObject(), { quantity: foundCartProduct.quantity }))
						})
					} else {
						Cart.findOneAndUpdate({ userId: user._id.toString() }, {
							$pull: {
								cart: {
									_id: product._id.toString()
								}
							}
						}, { new: true }).then(() => {
							resolve(Object.assign(product.toObject(), { quantity: 0 }))
						})
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
	console.log(activationCode, activationCodeType) // TODO

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

export const saveTicket = (body: any) => (
	new Ticket(body).save()
)

export const handleError = (error: any, path: string): Error => {
	if (error.httpCode) {
		return error
	}
	if (error.isJoi) {
		return new ServerError(error.message, HttpStatusCodes.BAD_REQUEST, path, false)
	}
	return new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, path, true)
}