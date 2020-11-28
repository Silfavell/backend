import mongoose, { Document, Schema } from 'mongoose'

export type AddressDocument = Document & {
	openAddress: string;
	addressTitle: string;
}

const addressSchema = new Schema({
	openAddress: {
		type: String,
		required: true
	},
	addressTitle: {
		type: String,
		required: true
	}
})

export default mongoose.model<AddressDocument>('Address', addressSchema)