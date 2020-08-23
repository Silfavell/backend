import mongoose, { Document, Schema } from 'mongoose'
import ProductSpecification, { ProductSpecificationDocument } from './ProductSpecification'
import ProductVariables, { ProductVariablesDocument } from './ProductVariables'

export type ProductDocument = Document & {
	categoryId: string,
	subCategoryId: string,
	brand: string,
	name: string,
	slug: string,
	details: string,
	type: Schema.Types.ObjectId
	specifications: [ProductSpecificationDocument]
	variables: ProductVariablesDocument
	price: number,
	discountedPrice: number,
	image: number,
	imageCount: number,
	purchasable: boolean,
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
	type: {
		type: Schema.Types.ObjectId,
		required: true
	},
	specifications: {
		type: [ProductSpecification.schema],
		required: true,
		default: []
	},
	variables: {
		type: ProductVariables.schema,
		required: true,
		default: {
			timesSold: 0,
			timesSearched: 0,
			comments: []
		}
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
	purchasable: {
		type: Boolean,
		required: true,
		default: true
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
	const product = this as ProductDocument
	if (product.isNew) {
		// eslint-disable-next-line no-use-before-define
		Product.find().sort({ image: -1 }).limit(1).then((total: ProductDocument[]) => {
			product.image = total.length === 0 ? 1 : total[0].image + 1
			next()
		})
	}
})

const Product = mongoose.model<ProductDocument>('Product', productSchema)

export default Product