// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductTypeDocument = Document & {
	name: string,
	slug: string,
	specifications: [string]
}

const productTypeSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true
	},
	specifications: {
		type: [String],
		default: []
	}
})

export default mongoose.model<ProductTypeDocument>('ProductType', productTypeSchema)