// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ActivationCodeDocument = Document & {
	userPhoneNumber: string,
	activationCodeType: number,
	activationCode: number
}

const activationCodeSchema = new Schema({
	userPhoneNumber: {
		type: String,
		required: true
	},
	activationCodeType: {
		type: String,
		required: true
	},
	activationCode: {
		type: Number,
		required: true
	}
})

export default mongoose.model<ActivationCodeDocument>('ActivationCode', activationCodeSchema)