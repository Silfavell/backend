import mongoose from 'mongoose'
import HttpStatusCodes from 'http-status-codes'
import sharp from 'sharp'

import { Elasticsearch } from '../../startup'
import {
	UserDocument,
	ProductDocument,
	Category,
	Product,
	ProductType,
	ProductVariables,
	Comment,
	Ticket,
	ProductTypeDocument,
	CategoryDocument,
	Cart,
	Brand,
	CartDocument,
	User
} from '../../models'
import ServerError from '../../errors/ServerError'
import ErrorMessages from '../../errors/ErrorMessages'
import ProductSort from '../../enums/product-sort-enum'

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

		/** SORT SPECS */
		{
			$unwind: {
				path: '$specifications',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$sort: {
				'specifications.slug': 1
			}
		},
		{
			$group: {
				_id: '$_id',
				root: { $first: '$$ROOT' },
				specifications: {
					$push: '$specifications'
				}
			}
		},
		{
			$addFields: {
				'root.specifications': '$specifications'
			}
		},
		{
			$replaceRoot: {
				newRoot: '$root'
			}
		},
		/** SORT SPECS */

		{
			$lookup: {
				from: Product.collection.name,
				let: { colorGroup: '$colorGroup' },
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$colorGroup', '$$colorGroup']
							}
						}
					},

					/** SORT SPECS */
					{
						$unwind: {
							path: '$specifications',
							preserveNullAndEmptyArrays: true
						}
					},
					{
						$sort: {
							'specifications.slug': 1
						}
					},
					{
						$group: {
							_id: '$_id',
							root: { $first: '$$ROOT' },
							specifications: {
								$push: '$specifications'
							}
						}
					},
					{
						$addFields: {
							'root.specifications': '$specifications'
						}
					},
					{
						$replaceRoot: {
							newRoot: '$root'
						}
					}
					/** SORT SPECS */
				],
				as: 'group'
			}
		},
		{
			$addFields: {
				groupSize: {
					$size: '$group'
				}
			}
		},
		{
			$unwind: {
				path: '$group',
				preserveNullAndEmptyArrays: true
			}
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
					},
					{
						groupSize: {
							$eq: 0
						}
					}
				]
			}
		},
		{
			$sort: {
				'group.color.name': 1
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
		},
		{
			$lookup: {
				from: Comment.collection.name,
				localField: '_id',
				foreignField: 'productId',
				as: 'comments'
			}
		},
		{
			$addFields: {
				comments: {
					$filter: {
						input: '$comments',
						as: 'comment',
						cond: {
							$eq: ['$$comment.verified', true]
						}
					}
				}
			}
		},
		{
			$project: {
				groupSize: 0
			}
		}
	])
)

export const getRelatedProducts = (slug: string) => (
	Product.aggregate([
		{
			$match: {
				slug: {
					$ne: slug
				}
			}
		},
		{
			$sample: {
				size: 8
			}
		}
	])
)

export const getProducts = () => (
	Product.find()
)

export const getProductsInCategories = () => (
	Category.aggregate([
		{
			$unwind: '$subCategories'
		},
		{
			$project: {
				name: 1,
				imagePath: 1,
				types: '$subCategories.types',
				subCategoryName: {
					$toString: '$subCategories.name'
				},
				subCategoryId: {
					$toString: '$subCategories._id'
				}
			}
		},
		{
			$unwind: '$types'
		},
		{
			$lookup: {
				from: ProductType.collection.name,
				foreignField: '_id',
				localField: 'types',
				as: 'type'
			}
		},
		{
			$lookup: {
				from: Product.collection.name,
				let: { typeId: '$types', subCategoryId: '$subCategoryId' },
				as: 'products',
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ['$$typeId', '$type']
									},
									{
										$eq: ['$$subCategoryId', '$subCategoryId']
									}
								]
							}
						}
					}
				]
			}
		},
		{
			$addFields: {
				'type.products': '$products'
			}
		},
		{
			$addFields: {
				type: {
					$arrayElemAt: ['$type', 0]
				}
			}
		},
		{
			$project: {
				name: 1,
				imagePath: 1,
				subCategoryName: 1,
				categoryId: '$_id',
				subCategoryId: 1,
				type: {
					name: '$type.name',
					products: {
						$filter: {
							input: '$type.products',
							as: 'product',
							cond: {
								$eq: ['$$product.purchasable', true]
							}
						}
					}
				}
			}
		},
		{
			$match: {
				'type.products.0': { $exists: true }
			}
		},
		{
			$sort: {
				name: 1
			}
		},
		{
			$group: {
				_id: '$subCategoryId',
				categoryId: { $first: '$categoryId' },
				imagePath: { $first: '$imagePath' },
				name: { $first: '$name' },
				subCategoryName: { $first: '$subCategoryName' },
				types: { $push: '$type' }
			}
		},
		{
			$sort: {
				_id: 1
			}
		},
		{
			$group: {
				_id: '$categoryId',
				name: { $first: '$name' },
				imagePath: { $first: '$imagePath' },
				subCategories: {
					$push: {
						_id: '$subCategoryId',
						parentCategoryId: '$categoryId',
						name: '$subCategoryName',
						types: '$types'
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
				let: { categoryId: '$_id' },
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
						$lookup: {
							from: ProductVariables.collection.name,
							localField: '_id',
							foreignField: 'productId',
							as: 'variables'
						}
					},
					{
						$addFields: {
							variables: {
								$arrayElemAt: ['$variables', 0]
							}
						}
					},
					{
						$sort: {
							'variables.timesSold': -1
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

export const getBestSellerMobileProducts = () => (
	Product.aggregate([
		{
			$match: {
				purchasable: true
			}
		},
		{
			$lookup: {
				from: ProductVariables.collection.name,
				localField: '_id',
				foreignField: 'productId',
				as: 'variables'
			}
		},
		{
			$addFields: {
				variables: {
					$arrayElemAt: ['$variables', 0]
				}
			}
		},
		{
			$sort: {
				'variables.timesSold': -1
			}
		},
		{
			$limit: 20
		}
	])
)

export const getMostSearchedMobileProducts = () => (
	Product.aggregate([
		{
			$match: {
				purchasable: true
			}
		},
		{
			$lookup: {
				from: ProductVariables.collection.name,
				localField: '_id',
				foreignField: 'productId',
				as: 'variables'
			}
		},
		{
			$addFields: {
				variables: {
					$arrayElemAt: ['$variables', 0]
				}
			}
		},
		{
			$sort: {
				'variables.timesSearched': -1
			}
		},
		{
			$limit: 20
		}
	])
)

export const getFilteredProductsWithCategories = (query: any) => {
	const match: any = [
		{
			$eq: ['$categoryId', query.categoryId]
		},
		{
			$eq: ['$subCategoryId', '$$subCategoryId']
		}
	]

	if (query.brands) {
		match.push({
			$in: ['$brand', (typeof query.brands === 'string' ? [query.brands] : query.brands)]
		})
	}

	const pipeline: any = [
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
					$sort: { price: 1 }
				})
				break
			}

			case ProductSort.MAX_PRICE: {
				pipeline.push({
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

export const addProductToCart = async (product: ProductDocument, cartObj: CartDocument, user: UserDocument, quantity: number) => {
	if (user?._id.toString()) {
		if (cartObj && cartObj.cart) {
			const foundCartProduct = cartObj.cart.find(((cartProduct) => cartProduct._id === product._id.toString()))

			if (foundCartProduct) {
				foundCartProduct.quantity += quantity

				await cartObj.save()

				Object.assign(product.toObject(), { quantity: foundCartProduct.quantity })
			} else {
				await Cart.findOneAndUpdate({ userId: user._id.toString() }, {
					$push: {
						cart: {
							_id: product._id.toString(),
							quantity
						}
					}
				}, { new: true })

				return Object.assign(product.toObject(), { quantity })
			}
		} else {
			await new Cart({
				userId: user._id.toString(),
				cart: [{
					_id: product._id.toString(),
					quantity
				}]
			}).save()

			return Object.assign(product.toObject(), { quantity })
		}
	}
	return product
}

export const setProductToCart = async (product: ProductDocument, cartObj: CartDocument, user: UserDocument, quantity: number) => {
	if (user?._id.toString()) {
		if (quantity === 0) {
			await Cart.findOneAndUpdate({ userId: user._id.toString() }, {
				$pull: {
					cart: {
						_id: product._id
					}
				}
			}, { new: true })

			return product
		}
		const foundProduct = cartObj.cart.find((cartProduct) => cartProduct._id.toString() === product._id.toString())
		if (foundProduct) {
			foundProduct.quantity = quantity
		} else {
			cartObj.cart.push({
				_id: product._id,
				quantity
			})
		}

		await cartObj.save()
		return Object.assign(product.toObject(), { quantity })
	}

	return product
}

export const takeOffProductFromCart = async (product: ProductDocument, cartObj: CartDocument, user: UserDocument, quantity: number) => {
	if (user?._id.toString()) {
		if (cartObj && cartObj.cart) {
			const foundCartProduct = cartObj.cart.find(((cartProduct) => cartProduct._id === product._id.toString()))

			if (foundCartProduct) {
				if (foundCartProduct.quantity > quantity) {
					foundCartProduct.quantity -= quantity

					await cartObj.save()

					Object.assign(product.toObject(), { quantity: foundCartProduct.quantity })
				} else {
					await Cart.findOneAndUpdate({ userId: user._id.toString() }, {
						$pull: {
							cart: {
								_id: product._id.toString()
							}
						}
					}, { new: true })

					return Object.assign(product.toObject(), { quantity: 0 })
				}
			} else {
				throw new ServerError(ErrorMessages.NON_EXISTS_PRODUCT_IN_CART, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT_IN_CART, false)
			}
		} else {
			throw new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, ErrorMessages.EMPTY_CART, false)
		}
	}

	return product
}

const getBlackList = () => [
	'category',
	'type',
	'categoryId',
	'subCategoryId',
	'brands',
	'productIds',
	'start',
	'quantity',
	'sortType',
	'minPrice',
	'maxPrice'
]

const getSpecificationFilterStages = (query: any) => {
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
			},
			{
				$match: {
					$expr: {
						$or: (
							specificationKeys.reduce((prevVal: any, curVal) => [...prevVal, {
								$and: [
									{
										$eq: ['$specs.slug', curVal],
									},
									{
										$in: ['$specs.value', (typeof query[curVal] === 'string' ? [query[curVal]] : query[curVal])]
									}
								]
							}], [])
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
					prods: { $first: '$prods' },
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
		]

		return stages
	}

	return []
}

const getListSpecificationsStages = (query: any) => {
	const specificationKeys = Object.keys(query).filter((key) => !getBlackList().includes(key))

	const otherFilters = [] // price,brands, etc.. filters. Other than specifications.

	if (query.brands && (typeof query.brands === 'string' ? [query.brands] : query.brands).length > 0) {
		otherFilters.push(
			{
				$addFields: {
					products: {
						$filter: {
							input: '$products',
							as: 'product',
							cond: {
								$in: ['$$product.brand', (typeof query.brands === 'string' ? [query.brands] : query.brands)]
							}
						}
					}
				}
			}
		)
	}

	if (query.price) {
		otherFilters.push(
			{
				$addFields: {
					products: {
						$filter: {
							input: '$products',
							as: 'product',
							cond: {
								$or: [
									{
										$and: [
											{
												$gte: ['$$product.discountedPrice', parseInt(query.minPrice)]
											},
											{
												$lte: ['$$product.discountedPrice', parseInt(query.maxPrice)]
											}
										]
									},
									{
										$and: [
											{
												$lt: ['$$product.discountedPrice', null]
											},
											{
												$gte: ['$$product.price', parseInt(query.minPrice)]
											},
											{
												$lte: ['$$product.price', parseInt(query.maxPrice)]
											}
										]
									}
								]
							}
						}
					}
				}
			}
		)
	}

	const stages: any = [
		{
			$addFields: {
				prods: '$products'
			}
		},
		...otherFilters,
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
				products: { $first: '$products' },
				prods: { $first: '$prods' }
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
				prods: { $first: '$prods' },
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
				prods: { $first: '$prods' },
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
				prods: 1,
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
				prods: 1,
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

		/** * */
		{
			$unwind: '$products'
		},
		{
			$addFields: {
				'products.specs': '$products.specifications'
			}
		},
		{
			$addFields: {
				products: {
					specs: {
						$filter: {
							input: '$products.specs',
							as: 'specification',
							cond: {
								$ne: ['$$specification.slug', '$values.slug']
							}
						}
					}
				}
			}
		},
		{
			$addFields: {
				products: {
					specs: {
						$filter: {
							input: '$products.specs',
							as: 'specification',
							cond: {
								$or: (
									specificationKeys.reduce((prevVal: any, curVal) => [...prevVal, {
										$and: [
											{
												$eq: ['$$specification.slug', curVal],
											},
											{
												$in: ['$$specification.value', (typeof query[curVal] === 'string' ? [query[curVal]] : query[curVal])]
											}
										]
									}], [])
								)
							}
						}
					}
				}
			}
		},
		{
			$addFields: {
				specsLength: specificationKeys,
				'products.specs': {
					$map: {
						input: '$products.specs',
						as: 'spec',
						in: '$$spec.slug'
					}
				}
			}
		},
		{
			$addFields: {
				specsLength: {
					$size: '$specsLength'
				}
			}
		},
		{
			$match: {
				$or: [
					{ // Should specs includes same length of queried keys
						[`products.specs.${specificationKeys.length - 1}`]: { $exists: true }
					},
					{ // Should specs includes same length -2 of queried keys and current slug (+1)
						$and: [
							{
								[`products.specs.${specificationKeys.length - 2}`]: { $exists: true }
							},
							{
								'values.slug': {
									$in: specificationKeys
								}
							}
						]
					},
					{ // Should specs length be 1 and it should be current slug
						$and: [
							{
								specsLength: { $eq: 1 }
							},
							{
								'values.slug': {
									$in: specificationKeys
								}
							}
						]
					},
					{
						specsLength: { $eq: 0 }
					}
				]
			}
		},
		{
			$group: {
				_id: '$_id',
				productId: { $first: '$_id' },
				categoryId: { $first: '$categoryId' },
				products: { $push: '$products' },
				prods: { $first: '$prods' }
			}
		},
		{
			$project: {
				'products.specs': 0
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
			$match: {
				$expr: {
					$or: [
						{
							$eq: ['$specifications.name', '$_id']
						},
						{
							$lte: ['$specifications.name', null]
						}
					]
				}
			}
		},
		{
			$group: {
				_id: { name: '$_id', slug: '$specifications.slug', val: '$specifications.value' },
				prods: { $first: '$prods' },
				count: { $sum: 1 }
			}
		},
		{
			$group: {
				_id: '$_id.name',
				slug: { $first: '$_id.slug' },
				prods: { $first: '$prods' },
				values: {
					$push: {
						value: '$_id.val',
						count: '$count'
					}
				}
			}
		},
		{
			$group: {
				_id: null,
				products: { $first: '$prods' },
				specifications: {
					$push: {
						name: '$_id',
						slug: '$slug',
						values: '$values'
					}
				}
			}
		},
		{
			$addFields: {
				specifications: {
					$filter: {
						input: '$specifications',
						as: 'specification',
						cond: {
							$gt: ['$$specification.name', null]
						}
					}
				}
			}
		}
	]

	return stages
}

const getSortSpecificationsStages = (): any[] => ([
	{
		$unwind: {
			path: '$specifications',
			preserveNullAndEmptyArrays: true
		}
	},
	{
		$unwind: {
			path: '$specifications.values',
			preserveNullAndEmptyArrays: true
		}
	},
	{
		$sort: {
			'specifications.values.value': 1
		}
	},
	{
		$group: {
			_id: '$specifications.name',
			products: { $first: '$products' },
			specifications: {
				$first: {
					name: '$specifications.name',
					slug: '$specifications.slug',
				}
			},
			values: { $push: '$specifications.values' }
		}
	},
	{
		$addFields: {
			'specifications.values': '$values'
		}
	},
	{
		$sort: {
			'specifications.name': 1
		}
	},
	{
		$group: {
			_id: null,
			specifications: { $push: '$specifications' },
			root: { $first: '$$ROOT' }
		}
	},
	{
		$addFields: {
			root: {
				specifications: {
					$filter: {
						input: '$specifications',
						as: 'specification',
						cond: {
							$gt: ['$$specification.name', null]
						}
					}
				}
			}
		}
	},
	{
		$replaceRoot: {
			newRoot: '$root'
		}
	}
])

const getBrandsStages = (filterStages: any[], query: any): any[] => {
	const otherFilters = [...filterStages]

	if (query.minPrice && query.maxPrice) {
		otherFilters.unshift(
			{
				$match: {
					$expr: {
						$or: [
							{
								$and: [
									{
										$gte: ['$products.discountedPrice', parseInt(query.minPrice)]
									},
									{
										$lte: ['$products.discountedPrice', parseInt(query.maxPrice)]
									}
								]
							},
							{
								$and: [
									{
										$lt: ['$products.discountedPrice', null]
									},
									{
										$gte: ['$products.price', parseInt(query.minPrice)]
									},
									{
										$lte: ['$products.price', parseInt(query.maxPrice)]
									}
								]
							}
						]
					}
				}
			}
		)
	}

	const stages = [
		{
			$addFields: {
				prods: '$products'
			}
		},
		{
			$unwind: '$products'
		},
		...otherFilters,
		{
			$group: {
				_id: '$categoryId',
				products: { $push: '$products' },
				prods: { $first: '$prods' },
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
				prods: { $first: '$prods' },
				specifications: { $first: '$specifications' },
				count: {
					$sum: 1
				}
			}
		},
		{
			$sort: {
				_id: 1
			}
		},
		{
			$group: {
				_id: '$imagePath',
				products: { $push: '$products' },
				prods: { $first: '$prods' },
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
				products: '$prods',
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

	return stages
}

const setUnmatchedFilters = (res: any, query: any) => (
	new Promise((resolve, reject) => {
		if (res?.specifications) {
			res.specifications.map((specification: { name: string; slug: string; values: { value: string; count: number }[] }) => {
				if (query[specification.slug]) {
					query[specification.slug] = typeof query[specification.slug] === 'string' ? [query[specification.slug]] : query[specification.slug]

					specification.values.map(({ value }) => {
						query[specification.slug].splice(query[specification.slug].indexOf(value), 1)
					})

					query[specification.slug].map((unmatchedFilter: string) => {
						specification.values.push({
							value: unmatchedFilter,
							count: 0
						})
					})
				}
			})
		}

		resolve(res)
	})
)

const setUnmatchedBrands = (res: any, query: any, isMobile?: boolean) => (
	new Promise((resolve, reject) => {
		const quantityKey = isMobile ? 'productQuantity' : 'count'

		if (query.brands && res?.brands) {
			query.brands = typeof query.brands === 'string' ? [query.brands] : query.brands

			res.brands.map((brand: { name: string; count: number }) => {
				query.brands.splice(query.brands.indexOf(brand.name), 1)
			})

			query.brands.map((unmatchedBrand: string) => {
				res.brands.push({
					name: unmatchedBrand,
					[quantityKey]: 0
				})
			})
		}

		resolve(res)
	})
)


export const filterShop = (query: any, params: any) => {
	const match = []
	const laterMatch = []
	const ext = []
	const laterExt = []
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
			$in: ['$products.brand', (typeof query.brands === 'string' ? [query.brands] : query.brands)]
		})
	}

	if (query.productIds) {
		match.push({
			$in: [
				'$_id',
				(typeof query.productIds === 'string' ? [query.productIds] : query.productIds).map((productId: string) => mongoose.Types.ObjectId(productId))
			]
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

	if (query.minPrice && query.maxPrice) {
		laterExt.push(
			{
				$match: {
					$expr: {
						$or: [
							{
								$and: [
									{
										$gte: ['$products.discountedPrice', parseInt(query.minPrice)]
									},
									{
										$lte: ['$products.discountedPrice', parseInt(query.maxPrice)]
									}
								]
							},
							{
								$and: [
									{
										$lt: ['$products.discountedPrice', null]
									},
									{
										$gte: ['$products.price', parseInt(query.minPrice)]
									},
									{
										$lte: ['$products.price', parseInt(query.maxPrice)]
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
			case ProductSort.CLASSIC: {
				laterExt.push({
					$sort: {
						'products._id': 1
					}
				})
				break
			}

			case ProductSort.BEST_SELLER: {
				laterExt.push({
					$sort: {
						'products.variables.timesSold': -1
					}
				})
				break
			}

			case ProductSort.NEWEST: {
				laterExt.push({
					$sort: {
						'products._id': -1
					}
				})
				break
			}

			case ProductSort.MIN_PRICE: {
				laterExt.push({
					$sort: {
						'products.price': 1
					}
				})
				break
			}

			case ProductSort.MAX_PRICE: {
				laterExt.push({
					$sort: {
						'products.price': -1
					}
				})
				break
			}

			default: {
				laterExt.push({
					$sort: {
						'products._id': 1
					}
				})
			}
		}
	} else {
		laterExt.push({
			$sort: {
				'products._id': 1
			}
		})
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
					{
						$lookup: {
							from: ProductVariables.collection.name,
							localField: '_id',
							foreignField: 'productId',
							as: 'variables'
						}
					},
					{
						$addFields: {
							variables: {
								$arrayElemAt: ['$variables', 0]
							}
						}
					},
					...ext
				],
				as: 'products'
			}
		},
		...(params.subCategory && query.type ? getListSpecificationsStages(query) : []),
		...(params.subCategory && query.type ? getSortSpecificationsStages() : []),
		...getBrandsStages((params.subCategory && query.type ? getSpecificationFilterStages(query) : []), query),
		{
			$addFields: {
				_id: {
					$arrayElemAt: ['$products', 0]
				},
				specifications: {
					$ifNull: ['$specifications', []]
				}
			}
		},
		{
			$addFields: {
				categoryId: '$_id.categoryId',
				subCategoryId: '$_id.subCategoryId',
			}
		},
		{
			$unwind: '$products'
		},
		...(params.subCategory && query.type ? getSpecificationFilterStages(query) : []),
		{
			$match: {
				$expr: {
					$and: laterMatch
				}
			}
		},
		{
			$project: {
				products: {
					specifications: 0
				}
			}
		},

		/** MAX,MIN PRICE */
		{
			$addFields: {
				'products.sortPrice': '$products.discountedPrice'
			}
		},
		{
			$addFields: {
				'products.sortPrice': {
					$ifNull: ['$products.sortPrice', '$products.price']
				}
			}
		},
		{
			$sort: {
				'products.sortPrice': 1
			}
		},
		{
			$group: {
				_id: '$categoryId',
				categoryId: { $first: '$categoryId' },
				subCategoryId: { $first: '$subCategoryId' },
				products: { $push: '$products' },
				specifications: { $first: '$specifications' },
				brands: { $first: '$brands' }
			}
		},
		{
			$addFields: {
				minPrice: {
					$arrayElemAt: ['$products', 0]
				},
				maxPrice: {
					$arrayElemAt: ['$products', -1]
				}
			}
		},
		{
			$addFields: {
				minPrice: {
					$floor: '$minPrice.sortPrice'
				},
				maxPrice: {
					$ceil: '$maxPrice.sortPrice'
				}
			}
		},
		{
			$project: {
				'products.sortPrice': 0
			}
		},
		{
			$addFields: {
				productsLength: { $size: '$products' }
			}
		},
		/** MAX,MIN PRICE */

		{
			$unwind: '$products'
		},
		...laterExt,
		{
			$group: {
				_id: '$categoryId',
				subCategoryId: { $first: '$subCategoryId' },
				products: { $push: '$products' },
				specifications: { $first: '$specifications' },
				brands: { $first: '$brands' },
				minPrice: { $first: '$minPrice' },
				maxPrice: { $first: '$maxPrice' },
				productsLength: { $first: '$productsLength' }
			}
		}
	]).then((res) => setUnmatchedFilters(res[0], query))
		.then((res) => setUnmatchedBrands(res, query))
}

export const productsFilterMobile = (query: any) => {
	const match = []
	const productsToGetBrandFilter = []
	const productsToGetPriceFilter = []
	let sort = {}

	if (query.brands) {
		match.push({
			$in: ['$$product.brand', (typeof query.brands === 'string' ? [query.brands] : query.brands)]
		})

		productsToGetPriceFilter.push({
			$in: ['$$product.brand', (typeof query.brands === 'string' ? [query.brands] : query.brands)]
		})
	}

	if (query.minPrice && query.maxPrice) {
		match.push({
			$or: [
				{
					$and: [
						{
							$gte: ['$$product.discountedPrice', parseInt(query.minPrice)]
						},
						{
							$lte: ['$$product.discountedPrice', parseInt(query.maxPrice)]
						}
					]
				},
				{
					$and: [
						{
							$lt: ['$$product.discountedPrice', null]
						},
						{
							$gte: ['$$product.price', parseInt(query.minPrice)]
						},
						{
							$lte: ['$$product.price', parseInt(query.maxPrice)]
						}
					]
				}
			]
		})

		productsToGetBrandFilter.push({
			$or: [
				{
					$and: [
						{
							$gte: ['$$product.discountedPrice', parseInt(query.minPrice)]
						},
						{
							$lte: ['$$product.discountedPrice', parseInt(query.maxPrice)]
						}
					]
				},
				{
					$and: [
						{
							$lt: ['$$product.discountedPrice', null]
						},
						{
							$gte: ['$$product.price', parseInt(query.minPrice)]
						},
						{
							$lte: ['$$product.price', parseInt(query.maxPrice)]
						}
					]
				}
			]
		})
	}

	if (query.sortType) {
		switch (parseInt(query.sortType)) {
			case ProductSort.CLASSIC: {
				sort = {
					$sort: {
						_id: 1
					}
				}
				break
			}

			case ProductSort.BEST_SELLER: {
				sort = {
					$sort: {
						'variables.timesSold': -1
					}
				}
				break
			}

			case ProductSort.NEWEST: {
				sort = {
					$sort: {
						_id: -1
					}
				}
				break
			}

			case ProductSort.MIN_PRICE: {
				sort = {
					$sort: {
						price: 1
					}
				}
				break
			}

			case ProductSort.MAX_PRICE: {
				sort = {
					$sort: {
						price: -1
					}
				}
				break
			}

			default: {
				sort = {
					$sort: {
						_id: 1
					}
				}
				break
			}
		}
	} else {
		sort = {
			$sort: {
				_id: 1
			}
		}
	}


	return Product.aggregate([
		{
			$match: {
				$and: [
					{
						categoryId: query.categoryId
					},
					{
						subCategoryId: query.subCategoryId
					}
				]
			}
		},
		{
			$lookup: {
				from: ProductVariables.collection.name,
				localField: '_id',
				foreignField: 'productId',
				as: 'variables'
			}
		},
		{
			$addFields: {
				variables: {
					$arrayElemAt: ['$variables', 0]
				}
			}
		},
		sort,
		{
			$group: {
				_id: null,
				products: {
					$push: '$$ROOT'
				}
			}
		},
		{
			$addFields: {
				productsToGetBrandFilter: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$and: productsToGetBrandFilter
						}
					}
				},
				productsToGetPriceFilter: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$and: productsToGetPriceFilter
						}
					}
				},
				products: {
					$filter: {
						input: '$products',
						as: 'product',
						cond: {
							$and: match
						}
					}
				}
			}
		},
		{
			$unwind: '$productsToGetPriceFilter'
		},
		{
			$addFields: {
				'productsToGetPriceFilter.sortPrice': '$productsToGetPriceFilter.discountedPrice'
			}
		},
		{
			$addFields: {
				'productsToGetPriceFilter.sortPrice': {
					$ifNull: ['$productsToGetPriceFilter.sortPrice', '$productsToGetPriceFilter.price']
				}
			}
		},
		{
			$sort: {
				'productsToGetPriceFilter.sortPrice': 1
			}
		},
		{
			$group: {
				_id: null,
				products: { $first: '$products' },
				productsToGetBrandFilter: { $first: '$productsToGetBrandFilter' },
				productsToGetPriceFilter: { $push: '$productsToGetPriceFilter' }
			}
		},
		{
			$addFields: {
				minPrice: {
					$arrayElemAt: ['$productsToGetPriceFilter', 0]
				},
				maxPrice: {
					$arrayElemAt: ['$productsToGetPriceFilter', -1]
				}
			}
		},
		{
			$addFields: {
				minPrice: '$minPrice.sortPrice',
				maxPrice: '$maxPrice.sortPrice'
			}
		},
		{
			$project: {
				'productsToGetPriceFilter.sortPrice': 0
			}
		},
		{
			$unwind: '$productsToGetBrandFilter'
		},
		{
			$group: {
				_id: '$productsToGetBrandFilter.brand',
				count: { $sum: 1 },
				products: { $first: '$products' },
				minPrice: { $first: '$minPrice' },
				maxPrice: { $first: '$maxPrice' }
			}
		},
		{
			$group: {
				_id: null,
				brands: {
					$push: {
						name: '$_id',
						productQuantity: '$count'
					}
				},
				products: { $first: '$products' },
				minPrice: { $first: '$minPrice' },
				maxPrice: { $first: '$maxPrice' }
			}
		}
	]).then((res) => {
		const mobile = true
		return setUnmatchedBrands(res[0], query, mobile)
	})
}

export const updateProductsSearchTimes = (productId: string, fromSearch: string) => {
	if (fromSearch === 'true') {
		return ProductVariables.findOneAndUpdate({ productId }, {
			$inc: {
				timesSearched: 1
			}
		})
	}

	return Promise.resolve()
}

const replaceProductId = (product: ProductDocument) => (
	JSON.parse(JSON.stringify(product).split('"_id":').join('"id":')) // TODO ??
)

export const getTickets = () => (
	Ticket.find()
)

export const saveCategoryToDatabase = (categoryContext: CategoryDocument) => (
	new Category(categoryContext).save()
)

export const saveSubCategoryToDatabase = (body: any) => (
	Category.findByIdAndUpdate(body.parentCategoryId, {
		$push: {
			subCategories: body
		}
	}, { new: true })
)

export const deleteSubCategoryFromDatabase = (body: any) => (
	Category.findByIdAndUpdate(body.parentCategoryId, {
		$pull: {
			subCategories: {
				_id: body._id
			}
		}
	}, { new: true })
)

export const deleteCategoryFromDatabase = async (categoryId: string) => {
	const category = await Category.findById(categoryId)

	if (category) {
		return await category.remove()
	}
	throw new ServerError(ErrorMessages.CATEGORY_IS_NOT_EXISTS, HttpStatusCodes.BAD_REQUEST, ErrorMessages.CATEGORY_IS_NOT_EXISTS, false)
}

export const updateCategory = (categoryId: string, categoryContext: CategoryDocument) => (
	Category.findByIdAndUpdate(categoryId, categoryContext)
)

export const isSubCategorySlugExists = (body: any, slug: string) => ( // is category exists ? isSubCategoryExists ? test. // TODO
	Category.findById(body.parentCategoryId).then((parentCategory) => {
		const subCategory = parentCategory.subCategories.find((subCategory) => subCategory.slug === slug)

		if (subCategory && body.subCategoryId !== subCategory._id.toString()) {
			throw new ServerError(ErrorMessages.ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_SUB_CATEGORY_WITH_THE_SAME_NAME, false)
		}

		return slug
	})
)

export const updateSubCategory = (body: any, slug: string) => ( // is category exists ? isSubCategoryExists ? test. // TODO
	Category.findById(body.parentCategoryId).then((parentCategory) => {
		const subCategory = parentCategory.subCategories.find((subCategory) => subCategory._id.toString() === body.subCategoryId)
		subCategory.name = body.name
		subCategory.types = body.types
		subCategory.slug = slug
		return parentCategory.save()
	})
)

export const isProductSlugExists = (slug: string, updateId?: string) => (
	Product.findOne({ slug }).then((product) => {
		if (slug && product && updateId !== product._id.toString()) {
			throw new ServerError(ErrorMessages.ANOTHER_PRODUCT_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_PRODUCT_WITH_THE_SAME_NAME, false)
		}

		return slug
	})
)

export const isCategorySlugExists = (slug: string, updateId?: string) => (
	Category.findOne({ slug }).then((category) => {
		if (category && updateId !== category._id.toString()) {
			throw new ServerError(ErrorMessages.ANOTHER_CATEGORY_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_CATEGORY_WITH_THE_SAME_NAME, false)
		}

		return slug
	})
)

export const saveProductToDatabase = (productBody: ProductDocument) => (
	new Product(productBody).save()
)

export const updateCategoryOfProduct = (product: ProductDocument) => (
	Category.findById(product.categoryId.toString()).then((category) => {
		const productCategoryBrand = category.brands.find((brand) => brand.name === product.brand)
		const productSubCategory = category.subCategories.find((subCategory) => subCategory._id.toString() === product.subCategoryId.toString())
		const productSubCategoryBrand = productSubCategory.brands.find((brand) => brand.name === product.brand)
		if (productCategoryBrand) {
			// eslint-disable-next-line no-param-reassign
			category.brands[category.brands.indexOf(productCategoryBrand)].productQuantity++

			if (productSubCategoryBrand) {
				productSubCategory.brands[productSubCategory.brands.indexOf(productSubCategoryBrand)].productQuantity++
			} else {
				productSubCategory.brands.push(new Brand({ name: product.brand, productQuantity: 1 }))
			}
		} else {
			category.brands.push(new Brand({ name: product.brand, productQuantity: 1 }))
			productSubCategory.brands.push(new Brand({ name: product.brand, productQuantity: 1 }))
		}

		return category.save().then(() => product)
	})
)

export const saveProductImages = (
	product: ProductDocument,
	images: Express.Multer.File[]
) => {
	sharp(images[0].buffer).resize(300, 300).toFile(`./public/assets/products/${product.slug}_300x300.webp`)

	images.map((image, index) => {
		sharp(image.buffer).toFile(`./public/assets/products/${product.slug}_${index}_940x940.webp`)
	})
}

export const indexProduct = (product: ProductDocument) => {
	if (product.purchasable) {
		return Elasticsearch.getClient.index({
			index: 'doc',
			type: 'doc',
			id: product._id,
			// refresh: true,
			body: replaceProductId(product)
		})
	}

	return search(product.name).then((result) => {
		if (result.body.hits.total > 0) {
			return removeProductFromSearch(product)
		}
	})
}

export const removeProductFromSearch = (product: ProductDocument) => (
	Elasticsearch.getClient.delete({
		index: 'doc',
		type: 'doc',
		id: product._id
	})
)

export const updateProduct = (productId: string, productContext: ProductDocument, slug: string) => {
	if (slug) {
		productContext.slug = slug
	}

	return Product.findByIdAndUpdate(productId, productContext, { new: true })
}

export const deleteProductFromDatabase = (productId: string) => (
	Product.findByIdAndDelete(productId)
)

export const isTypeSlugExists = (slug: string, updateId?: string) => (
	ProductType.findOne({ slug }).then((type) => {
		if (type && updateId !== type._id.toString()) {
			throw new ServerError(ErrorMessages.ANOTHER_TYPE_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_TYPE_WITH_THE_SAME_NAME, false)
		}

		return slug
	})
)

export const saveType = (body: ProductTypeDocument) => (
	new ProductType(body).save()
)

export const updateType = (id: string, body: ProductTypeDocument) => (
	ProductType.findByIdAndUpdate(id, body, { new: true })
)

export const deleteType = async (id: string) => {
	const type = await ProductType.findById(id)

	return await type.remove()
}

export const getTypes = () => (
	ProductType.find()
)

export const getWaitingComments = () => (
	Comment.find({ verified: false })
)

export const verifyComment = (_id: string) => (
	Comment.findByIdAndUpdate(_id, { verified: true }, { new: true })
)

export const deleteComment = (_id: string) => (
	Comment.findByIdAndDelete(_id)
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
