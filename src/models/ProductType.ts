// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductTypeDocument = Document & {
	name: string,
	slug: string,
	specifications: [Schema.Types.ObjectId]
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
	specifications: [Schema.Types.ObjectId] // TODO ?
})

export default mongoose.model<ProductTypeDocument>('ProductType', productTypeSchema)