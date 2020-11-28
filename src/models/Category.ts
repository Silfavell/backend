import HttpStatusCodes from 'http-status-codes'
import mongoose, { Document, Schema } from 'mongoose'

import SubCategory, { SubCategoryDocument } from './SubCategory'
import Product from './Product'
import Brand, { BrandDocument } from './Brand'
import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'


export type CategoryDocument = Document & {
	name: string;
	slug: string;
	subCategories: [SubCategoryDocument];
	brands: [BrandDocument];
	imagePath: number;
}

const categorySchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	subCategories: [SubCategory.schema],
	brands: [Brand.schema],
	imagePath: {
		type: Number,
		default: 0,
		required: true,
		unique: true
	}
})

categorySchema.pre('save', function (next) {
	const category = this as CategoryDocument
	if (category.isNew) {
		// eslint-disable-next-line no-use-before-define
		Category.find().sort({ imagePath: -1 }).limit(1).then((total) => {
			category.imagePath = total.length === 0 ? 1 : total[0].imagePath + 1
			next()
		})
	} else {
		next()
	}
})

categorySchema.pre('remove', async function (next) {
	const category = this as CategoryDocument

	if (category.subCategories.length > 0) {
		next(new ServerError(ErrorMessages.CAN_NOT_DELETE_CATEGORY, HttpStatusCodes.BAD_REQUEST, ErrorMessages.CAN_NOT_DELETE_CATEGORY, false))
	}

	next()
})

categorySchema.pre('findOneAndUpdate', async function (next) {
	const category = this as any

	if (category._update.$pull?.subCategories) {
		const productCountBelongsToThisSubCategory = await Product.count({ subCategoryId: category._update.$pull.subCategories._id })

		if (productCountBelongsToThisSubCategory > 0) {
			next(new ServerError(ErrorMessages.CAN_NOT_DELETE_SUB_CATEGORY, HttpStatusCodes.BAD_REQUEST, ErrorMessages.CAN_NOT_DELETE_CATEGORY, false))
		}
	}

	next()
})

const Category = mongoose.model<CategoryDocument>('Category', categorySchema)

export default Category