import mongoose, { Document, Schema } from 'mongoose'

import Product, { ProductDocument } from './Product'
import OrderStatus from '../enums/order-status-enum'

export type OrderDocument = Document & {
	id: string,
	customer: string,
	phoneNumber: string,
	address: string,
	date: Date,
	products: ProductDocument[],
	status: OrderStatus,
	message: string,
	paidPrice: number,
	returnItems: [{
		_id: Schema.Types.ObjectId,
		quantity: number
	}]
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
			slug: {
				type: String,
				required: true
			},
			image: {
				type: Number,
				required: true
			},
			quantity: {
				type: Number
			},
			paidPrice: {
				type: Number,
				required: true
			}
		}],
		required: true
	},
	status: {
		type: Number,
		enum: [0, 1, 2, 3, 4, 5],
		default: 0
	},
	message: {
		type: String,
		default: null
	},
	paidPrice: {
		type: Number,
		required: true
	},
	returnItems: [{
		_id: {
			type: Schema.Types.ObjectId,
			required: true
		},
		quantity: {
			type: Number,
			required: true
		}
	}]
}, {
	timestamps: true
})

export default mongoose.model<OrderDocument>('Order', orderSchema)