// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type SubCategoryDocument = Document & {
	name: string
}

const subCategorySchema = new Schema({
	name: {
		type: String,
		unique: true
	}
})

export default mongoose.model<SubCategoryDocument>('SubCategory', subCategorySchema)