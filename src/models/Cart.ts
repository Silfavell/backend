import mongoose, { Document, Schema } from 'mongoose'

export type CartDocument = Document & {
	userId: string
	cart: [{
		_id: string
		quantity: number
	}]
}

const cartSchema = new Schema({
	userId: {
		type: String,
		required: true,
		unique: true
	},
	cart: [{
		_id: {
			type: String,
			required: true
		},
		quantity: {
			type: Number,
			required: true
		}
	}]
})

export default mongoose.model<CartDocument>('Cart', cartSchema)