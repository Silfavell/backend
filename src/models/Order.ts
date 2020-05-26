// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

// eslint-disable-next-line no-unused-vars
import Product, { ProductDocument } from './Product'

export type OrderDocument = Document & {
	id: string,
	customer: string,
	phoneNumber: string,
	address: string,
	date: Date,
	products: ProductDocument[],
	status: boolean
}

const orderSchema = new Schema({
	customer: {
		type: String,
		required: true
	},
	phoneNumber: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		required: true,
		default: Date.now()
	},
	products: {
		type: [{
			...Product.schema.obj,
			quantity: {
				type: Number
			}
		}],
		required: true
	},
	status: {
		type: Boolean,
		default: null
	}
}, {
	timestamps: true
})

export default mongoose.model<OrderDocument>('Order', orderSchema)