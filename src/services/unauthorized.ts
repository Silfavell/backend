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
	Ticket,
	ProductType
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

	const from = 'Silfavell'

	smsManager.message.sendSms(from, to, message)
}

export const getCategories = () => (
	Category.aggregate([
		{
			$unwind: {
				path: '$subCategories',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$addFields: {
				subCategories: { $ifNull: ['$subCategories', { types: [] }] }
			}
		},
		{
			$lookup: {
				from: ProductType.collection.name,
				let: { 'types': '$subCategories.types' },
				pipeline: [
					{
						$match: {
							$expr: {
								$in: ['$_id', '$$types']
							}
						}
					}
				],
				as: 'subCategories.types'
			}
		},
		{
			$group: {
				_id: '$_id',
				imagePath: { $first: '$imagePath' },
				name: { $first: '$name' },
				slug: { $first: '$slug' },
				brands: { $first: '$brands' },
				subCategories: { $push: '$subCategories' }
			}
		},
		{
			$project: {
				_id: 1,
				imagePath: 1,
				name: 1,
				slug: 1,
				brands: 1,
				subCategories: {
					$filter: {
						input: '$subCategories',
						as: 'subCategory',
						cond: { $gt: ['$$subCategory._id', null] }
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
				name: 1,
				imagePath: 1,
				brands: 1,
				subCategoryName: 1,
				subCategoryId: 1,
				products: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$eq: ['$$product.purchasable', true]
						}
					}
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

export const getBestSellerProducts = () => (
	Category.aggregate([
		{
			$project: {
				_id: {
					$toString: '$_id'
				},
				name: 1,
				brands: 1,
				imagePath: 1,
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				let: { 'categoryId': '$_id' },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$$categoryId', '$categoryId']
									}, {
										$eq: ['$purchasable', true]
									}
								]
							}
						}
					},
					{
						$sort: {
							timesSold: -1
						}
					},
					{
						$limit: 20
					}
				],
				as: 'products'
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
				products: { $first: '$products' }
			}
		},
		{
			$sort: {
				imagePath: 1
			}
		}
	])
)

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
				name: 1,
				imagePath: 1,
				brands: 1,
				subCategoryName: 1,
				subCategoryId: 1,
				products: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$eq: ['$$product.purchasable', true]
						}
					}
				}
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

const getBlackList = () => {
	return [
		'category',
		'type',
		'categoryId',
		'subCategoryId',
		'brands',
		'productIds',
		'start',
		'quantity',
		'sortType',
		'price'
	]
}

const getSpecificationFilterStages = (query: any, outOf?: string) => {
	const specificationKeys = Object.keys(query).filter((key) => !getBlackList().includes(key))

	if (specificationKeys.length > 0) {
		const stages = [
			{
				$addFields: {
					specs: '$products.specifications'
				}
			},
			{
				$unwind: '$specs'
			}
		]

		if (outOf) {
			stages.push(
				{
					// @ts-ignore
					$match: {
						$expr: {
							$ne: ['$specs.slug', outOf]
						}
					}
				}
			)
		}

		stages.push(
			{
				// @ts-ignore
				$match: {
					$expr: {
						$or: (
							specificationKeys.reduce((prevVal: any, curVal) => {
								return [...prevVal, {
									$and: [
										{
											$eq: ['$specs.slug', curVal],
										},
										{
											$in: ['$specs.value', query[curVal].split(',')]
										}
									]
								}]
							}, [])
						)
					}
				}
			},
			{
				$group: {
					_id: '$products._id',
					categoryId: { $first: '$categoryId' },
					subCategoryId: { $first: '$subCategoryId' },
					products: { $first: '$products' },
					specifications: { $first: '$specifications' },
					values: { $first: '$values' },
					brands: { $first: '$brands' },
					specs: { $push: '$specs' }
				}
			},
			{
				$match: {
					[`specs.${specificationKeys.length - 1}`]: { $exists: true }
				}
			}
		)

		return stages
	}

	return []
}

const getListSpecificationsStages = (query: any) => {
	const stages = [
		{
			// @ts-ignore
			$unwind: '$products'
		},
		...getSpecificationFilterStages(query),
		{
			$group: {
				_id: '$categoryId',
				categoryId: { $first: '$categoryId' },
				products: { $push: '$products' },
				specifications: { $first: '$specifications' }
			}
		},
		{
			$addFields: {
				specifications: {
					$map: {
						input: '$products',
						as: 'product',
						in: '$$product.specifications'
					}
				}
			}
		},
		{
			$addFields: {
				specifications: {
					$reduce: {
						input: '$specifications',
						initialValue: [] as string[],
						in: { $concatArrays: ['$$value', '$$this'] }
					}
				}
			}
		},
		{
			$unwind: {
				path: '$specifications',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: '$specifications.name',
				specificationSlug: { $first: '$specifications.slug' },
				values: { $push: '$specifications.value' },
				productId: { $first: '$_id' },
				categoryId: { $first: '$categoryId' },
				products: { $first: '$products' }
			}
		},
		{
			$unwind: {
				path: '$values',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: { name: '$_id', slug: '$specificationSlug', val: '$values' },
				productId: { $first: '$productId' },
				categoryId: { $first: '$categoryId' },
				products: { $first: '$products' },
				count: { $sum: 1 }
			}
		},
		{
			$group: {
				_id: '$_id.name',
				specificationSlug: { $first: '$_id.slug' },
				productId: { $first: '$productId' },
				categoryId: { $first: '$categoryId' },
				products: { $first: '$products' },
				values: {
					$push: {
						value: '$_id.val',
						count: '$count'
					}
				}
			}
		},
		{
			$project: {
				_id: 1,
				productId: 1,
				categoryId: 1,
				products: 1,
				values: {
					name: '$_id',
					slug: '$specificationSlug',
					values: '$values'
				}
			}
		},
		{
			$project: {
				_id: 1,
				productId: 1,
				categoryId: 1,
				products: 1,
				values: {
					$filter: {
						input: '$values',
						as: 'value',
						cond: {
							$ne: ['$$value.slug', null]
						}
					}
				}
			}
		},
		{
			$addFields: {
				values: {
					$arrayElemAt: ['$values', 0]
				}
			}
		},

		//	/* ***/
		//	{
		//		// @ts-ignore
		//		$unwind: '$products'
		//	},
		//	...getSpecificationFilterStages(query, '$values.slug'),
		//	{
		//		$group: {
		//			_id: '$categoryId',
		//			products: { $push: '$products' },
		//			valuesSlug: { $first: '$values.slug' },
		//			specifications: { $first: '$specifications' }
		//		}
		//	},
		//	{
		//		$addFields: {
		//			specifications: {
		//				$map: {
		//					input: '$products',
		//					as: 'product',
		//					in: '$$product.specifications'
		//				}
		//			}
		//		}
		//	},
		//	{
		//		$addFields: {
		//			specifications: {
		//				$reduce: {
		//					input: '$specifications',
		//					initialValue: [] as string[],
		//					in: { $concatArrays: ['$$value', '$$this'] }
		//				}
		//			}
		//		}
		//	},
		//	{
		//		$unwind: {
		//			path: '$specifications',
		//			preserveNullAndEmptyArrays: true
		//		}
		//	},
		//	{
		//		$group: {
		//			_id: '$specifications.name',
		//			specificationSlug: { $first: '$specifications.slug' },
		//			valuesSlug: { $first: '$valuesSlug' },
		//			values: { $push: '$specifications.value' },
		//			productId: { $first: '$_id' },
		//			products: { $first: '$products' }
		//		}
		//	},
		//	{
		//		$unwind: {
		//			path: '$values',
		//			preserveNullAndEmptyArrays: true
		//		}
		//	},
		//	{
		//		$group: {
		//			_id: { name: '$_id', slug: '$specificationSlug', val: '$values' },
		//			valuesSlug: { $first: '$valuesSlug' },
		//			productId: { $first: '$productId' },
		//			products: { $first: '$products' },
		//			count: { $sum: 1 }
		//		}
		//	},
		//	{
		//		$group: {
		//			_id: '$_id.name',
		//			specificationSlug: { $first: '$_id.slug' },
		//			valuesSlug: { $first: '$valuesSlug' },
		//			productId: { $first: '$productId' },
		//			products: { $first: '$products' },
		//			values: {
		//				$push: {
		//					value: '$_id.val',
		//					count: '$count'
		//				}
		//			}
		//		}
		//	},
		//	{
		//		$match: {
		//			$expr: {
		//				$eq: ['$specificationSlug', '$valuesSlug']
		//			}
		//		}
		//	},
		//	{
		//		$project: {
		//			_id: 1,
		//			productId: 1,
		//			products: 1,
		//			values: {
		//				name: '$_id',
		//				slug: '$specificationSlug',
		//				values: '$values'
		//			}
		//		}
		//	},
		//	{
		//		$project: {
		//			_id: 1,
		//			productId: 1,
		//			products: 1,
		//			values: {
		//				$filter: {
		//					input: '$values',
		//					as: 'value',
		//					cond: {
		//						$ne: ['$$value.slug', null]
		//					}
		//				}
		//			}
		//		}
		//	},
		//	{
		//		$group: {
		//			_id: '$productId',
		//			products: { $first: '$products' },
		//			specifications: {
		//				$push: {
		//					$arrayElemAt: ['$values', 0]
		//				}
		//			}
		//		}
		//	},
		//	{
		//		$project: {
		//			products: {
		//				specs: 0
		//			}
		//		}
		//	}
	]

	return stages
}

const getSortSpecificationsStages = () => ([
	{
		$unwind: {
			path: '$specifications',
			preserveNullAndEmptyArrays: true
		}
	},
	{
		$sort: {
			'specifications.name': 1
		}
	},
	{
		$group: {
			_id: '$_id',
			specifications: { $push: '$specifications' },
			root: { $first: '$$ROOT' }
		}
	},
	{
		$addFields: {
			root: {
				specifications: '$specifications'
			}
		}
	},
	{
		$replaceRoot: {
			newRoot: '$root'
		}
	}
])

const getBrandsStages = (filterStages: any[]) => {
	const stages = [
		{
			// @ts-ignore
			$unwind: '$products'
		},
		...filterStages,
		{
			$group: {
				_id: '$categoryId',
				products: { $push: '$products' },
				specifications: { $first: '$specifications' },
				brands: { $first: '$brands' }
			}
		},
		{
			$unwind: {
				path: '$products',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$group: {
				_id: '$products.brand',
				products: { $push: '$products' },
				specifications: { $first: '$specifications' },
				count: {
					$sum: 1
				}
			}
		},
		{
			$group: {
				_id: '$imagePath',
				products: { $push: '$products' },
				specifications: { $first: '$specifications' },
				brands: {
					$push: {
						name: '$_id',
						count: '$count'
					}
				}
			}
		},
		{
			$addFields: {
				products: {
					$reduce: {
						input: '$products',
						initialValue: [] as string[],
						in: { $concatArrays: ['$$value', '$$this'] }
					}
				}
			}
		},
		{
			$project: {
				_id: 1,
				products: 1,
				specifications: 1,
				brands: {
					$filter: {
						input: '$brands',
						as: 'brand',
						cond: { $gt: ['$$brand.name', null] }
					}
				}
			}
		}
	]

	/*
	stages.unshift({
		$addFields: {
			// @ts-ignore
			products: {
				$filter: {
					input: '$products',
					as: 'product',
					cond: {
						$in: ['$$product.brand', brands]
					}
				}
			}
		}
	})
	*/

	return stages
}

export const filterShop = (query: any, params: any) => {
	const match = []
	const laterMatch = []
	const laterExt = []
	const ext = []
	const categoryMatch = []

	if (params.category) {
		if (params.subCategory) {
			categoryMatch.push(
				{
					$match: {
						slug: params.category
					}
				},
				{
					$unwind: '$subCategories'
				},
				{
					$match: {
						'subCategories.slug': params.subCategory
					}
				},
				{
					$project: {
						categoryId: {
							$toString: '$_id'
						},
						subCategoryId: {
							$toString: '$subCategories._id'
						}
					}
				}
			)

			match.push({
				$and: [
					{
						$eq: ['$categoryId', '$$categoryId']
					},
					{
						$eq: ['$subCategoryId', '$$subCategoryId']
					}
				]
			})
		} else {
			categoryMatch.push(
				{
					$match: {
						slug: params.category
					}
				},
				{
					$project: {
						categoryId: {
							$toString: '$_id'
						}
					}
				}
			)

			match.push({
				$eq: ['$categoryId', '$$categoryId']
			})
		}
	}

	if (query.type) {
		ext.push(
			{
				$lookup: {
					from: ProductType.collection.name,
					pipeline: [
						{
							$match: {
								$expr: {
									$eq: [query.type, '$slug']
								}
							}
						}
					],
					as: 'typeObj'
				}
			},
			{
				$addFields: {
					typeObj: { $arrayElemAt: ['$typeObj', 0] }
				}
			},
			{
				$match: {
					$expr: {
						$eq: ['$typeObj._id', '$type']
					}
				}
			},
			{
				$project: {
					typeObj: 0
				}
			}
		)
	}

	if (query.categoryId) {
		match.push({
			$eq: ['$categoryId', query.categoryId]
		})
	}

	if (query.subCategoryId) {
		match.push({
			$eq: ['$subCategoryId', query.subCategoryId]
		})
	}

	if (query.brands) {
		laterMatch.push({
			$in: ['$products.brand', query.brands.split(',')]
		})
	}

	if (query.productIds) {
		match.push({
			$in: ['$_id', query.productIds.split(',').map((productId: string) => mongoose.Types.ObjectId(productId))]
		})
	}

	if (query.start) {
		laterExt.push({
			$skip: parseInt(query.start)
		})
	}

	if (query.quantity) {
		laterExt.push({
			$limit: parseInt(query.quantity)
		})
	}

	if (query.price) {
		ext.push(
			{
				$addFields: {
					doNotHasDicountedPrice: {
						$ifNull: ['$price', true]
					}
				}
			},
			{
				$match: {
					$expr: {
						$or: [
							{
								$and: [
									{
										$gte: ['$discountedPrice', parseInt(query.price.split('-')[0])]
									},
									{
										$lte: ['$discountedPrice', parseInt(query.price.split('-')[1])]
									}
								]
							},
							{
								$and: [
									{
										$eq: ['$doNotHasDicountedPrice', true]
									},
									{
										$gte: ['$price', parseInt(query.price.split('-')[0])]
									},
									{
										$lte: ['$price', parseInt(query.price.split('-')[1])]
									}
								]
							}
						]
					}
				}
			}
		)
	}

	if (query.sortType) {
		switch (parseInt(query.sortType)) {
			case ProductSort.MIN_PRICE: {
				laterExt.push({
					$sort: {
						'products.price': -1
					}
				})
				break
			}

			case ProductSort.MAX_PRICE: {
				laterExt.push({
					$sort: {
						'products.price': 1
					}
				})
				break
			}

			default: break
		}
	}

	match.push({
		$eq: ['$purchasable', true]
	})

	return Category.aggregate([
		...categoryMatch,
		{
			$lookup: {
				from: Product.collection.name,
				let: {
					categoryId: '$categoryId',
					subCategoryId: '$subCategoryId'
				},
				pipeline: [
					{
						$match: {
							$expr: {
								$and: match
							}
						}
					},
					...ext,
				],
				as: 'products'
			}
		},
		...getListSpecificationsStages(query),
		//	...getSortSpecificationsStages(),
		//	...getBrandsStages(getSpecificationFilterStages(query)),
		//	{
		//		$unwind: '$products'
		//	},
		//	...getSpecificationFilterStages(query),
		//	{
		//		$match: {
		//			$expr: {
		//				$and: laterMatch
		//			}
		//		}
		//	},
		//	{
		//		$project: {
		//			products: {
		//				specifications: 0
		//			}
		//		}
		//	},
		//	...laterExt,
		//	{
		//		$group: {
		//			_id: null,
		//			products: { $push: '$products' },
		//			productsLength: { $first: '$productsLength' },
		//			specifications: { $first: '$specifications' },
		//			brands: { $first: '$brands' }
		//		}
		//	}
	])
}

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
	Product.findById(productId).then((product: ProductDocument) => {
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