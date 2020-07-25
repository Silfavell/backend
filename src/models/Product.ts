// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductDocument = Document & {
	categoryId: string,
	subCategoryId: string,
	brand: string,
	name: string,
	slug: string,
	details: string,
	specifications: {
		form: string,
		benefit: string,
		colorDetail: string,
		kind: string,
		brushThickness: string,
		feature: string
	}
	price: number,
	discountedPrice: number,
	image: number,
	imageCount: number,
	color: {
		name: string,
		code: string
	},
	colorGroup: Schema.Types.ObjectId
}

const productSchema = new Schema({
	categoryId: {
		type: String,
		required: true
	},
	subCategoryId: {
		type: String,
		required: true
	},
	brand: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	details: {
		type: String
	},
	specifications: {
		form: String,
		benefit: String,
		colorDetail: String,
		kind: String,
		brushThickness: String,
		feature: String
	},
	price: {
		type: Number,
		required: true,
		min: 0
	},
	discountedPrice: {
		type: Number,
		min: 0
	},
	image: {
		type: Number,
		default: 0,
		required: true,
		unique: true
	},
	imageCount: {
		type: Number,
		default: 0,
		required: true
	},
	color: {
		name: {
			type: String
		},
		code: {
			type: String
		}
	},
	colorGroup: {
		type: Schema.Types.ObjectId,
		required: true,
		default: mongoose.Types.ObjectId()
	}
})

// eslint-disable-next-line func-names
productSchema.pre('save', function (next) {
	const product = this
	if (product.isNew) {
		// eslint-disable-next-line no-use-before-define
		Product.find().sort({ image: -1 }).limit(1).then((total) => {
			// @ts-ignore
			product.image = total.length === 0 ? 1 : total[0].image + 1
			next()
		})
	}
})

const Product = mongoose.model('Product', productSchema)

export default Product