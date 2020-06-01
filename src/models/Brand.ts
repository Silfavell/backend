// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type BrandDocument = Document & {
	name: string,
	productQuantity: number
}

const brandSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	productQuantity: {
		type: Number,
		required: true
	}
})

export default mongoose.model<BrandDocument>('Brand', brandSchema)