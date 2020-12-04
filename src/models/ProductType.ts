import HttpStatusCodes from 'http-status-codes'
import mongoose, { Document, Schema } from 'mongoose'

import Product from './Product'
import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'

export type ProductTypeDocument = Document & {
	name: string
	slug: string
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


productTypeSchema.pre('remove', async function (next) {
	const type = this as ProductTypeDocument

	const productsBelongsToThisType = await Product.count({ type: type._id })
	if (productsBelongsToThisType > 0) {
		next(new ServerError(ErrorMessages.CAN_NOT_DELETE_TYPE, HttpStatusCodes.BAD_REQUEST, ErrorMessages.CAN_NOT_DELETE_TYPE, false))
	}

	next()
})

export default mongoose.model<ProductTypeDocument>('ProductType', productTypeSchema)