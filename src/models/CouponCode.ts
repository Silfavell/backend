import mongoose, { Document, Schema } from 'mongoose'

export type CouponCodeDocument = Document & {
    couponCode: number
    isUsed: boolean
    belongTo: mongoose.Types.ObjectId
}

const couponCodeSchema = new Schema({
	couponCode: {
		type: Number,
		required: true
	},
	isUsed: {
		type: Boolean,
		required: true,
		default: false
	},
	belongTo: {
		type: mongoose.Types.ObjectId,
		required: true
	}
})

export default mongoose.model<CouponCodeDocument>('CouponCode', couponCodeSchema)