// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductTypeDocument = Document & {
	name: string,
	specifications: [Schema.Types.ObjectId]
}

const productTypeSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	specifications: [{
		_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		name: {
			type: String,
			required: true
		}
	}]
})

export default mongoose.model<ProductTypeDocument>('ProductType', productTypeSchema)