// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'
// eslint-disable-next-line no-unused-vars
import Brand, { BrandDocument } from './Brand'

export type SubCategoryDocument = Document & {
	name: string,
	slug: string,
	brands: [BrandDocument]
}

const subCategorySchema = new Schema({
	name: {
		type: String
	},
	slug: {
		type: String,
		required: true,
		unique: true
	},
	brands: [Brand.schema]
})

export default mongoose.model<SubCategoryDocument>('SubCategory', subCategorySchema)