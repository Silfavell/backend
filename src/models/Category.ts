// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'
// eslint-disable-next-line no-unused-vars
import SubCategory, { SubCategoryDocument } from './SubCategory'
// eslint-disable-next-line no-unused-vars
import Brand, { BrandDocument } from './Brand'

export type CategoryDocument = Document & {
	name: string,
	slug: string,
	subCategories: [SubCategoryDocument],
	brands: [BrandDocument],
	imagePath: number
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


// eslint-disable-next-line func-names
categorySchema.pre('save', function (next) {
	const category = this
	if (category.isNew) {
		// eslint-disable-next-line no-use-before-define
		Category.find().sort({ imagePath: -1 }).limit(1).then((total) => {
			// @ts-ignore
			category.imagePath = total.length === 0 ? 1 : total[0].imagePath + 1
			next()
		})
	} else {
		next()
	}
})

const Category = mongoose.model<CategoryDocument>('Category', categorySchema)

export default Category