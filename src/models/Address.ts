// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type AddressDocument = Document & {
	openAddress: string,
	addressTitle: string,
	buildingNo: string,
	floor: string,
	aptNo: string,
	directions: string
}

const addressSchema = new Schema({
	openAddress: {
		type: String,
		required: true
	},
	addressTitle: {
		type: String,
		required: true
	},
	buildingNo: {
		type: String
	},
	floor: {
		type: String
	},
	aptNo: {
		type: String
	},
	directions: {
		type: String
	}
})

export default mongoose.model<AddressDocument>('Address', addressSchema)