import mongoose, { Document, Schema } from 'mongoose'

import Product, { ProductDocument } from './Product'

export type OrderDocument = Document & {
	id: string,
	customer: string,
	phoneNumber: string,
	address: string,
	date: Date,
	products: ProductDocument[],
	status: boolean,
	trackingNumber: string,
	cancellationReason: string,
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
		type: Boolean,
		default: null
	},
	trackingNumber: {
		type: String,
		default: null
	},
	cancellationReason: {
		type: String,
		default: null
	},
	paidPrice: {
		type: Number,
		required: true
	},
	returnable: {
		type: Boolean,
		required: true,
		default: false
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