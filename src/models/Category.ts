// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type CategoryDocument = Document & {
	name: string,
	imagePath: number
}

const categorySchema = new Schema({
	name: {
		type: String,
		unique: true
	},
	imagePath: {
		type: Number,
		default: 0
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
	}
})

const Category = mongoose.model<CategoryDocument>('Category', categorySchema)

export default Category