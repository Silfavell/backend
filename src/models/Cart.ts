// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type CartDocument = Document & {
	userId: string,
	cart: any
}

const cartSchema = new Schema({
	userId: {
		type: String,
		required: true
	},
	cart: {
		type: Schema.Types.Mixed,
		required: true
	}
})

export default mongoose.model<CartDocument>('Cart', cartSchema)