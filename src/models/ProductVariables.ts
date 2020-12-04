import mongoose, { Document, Schema } from 'mongoose'

export type ProductVariablesDocument = Document & {
    productId: mongoose.Types.ObjectId;
    timesSold: number;
    timesSearched: number;
}

const productVariables = new Schema({
	productId: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	timesSold: {
		type: Number,
		required: true,
		default: 0
	},
	timesSearched: {
		type: Number,
		required: true,
		default: 0
	}
})

export default mongoose.model<ProductVariablesDocument>('ProductVariables', productVariables)