// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'
// eslint-disable-next-line no-unused-vars
import Brand, { BrandDocument } from './Brand'

export type SubCategoryDocument = Document & {
	name: string,
	brands: [BrandDocument]
}

const subCategorySchema = new Schema({
	name: {
		type: String
	},
	brands: [Brand.schema]
})

export default mongoose.model<SubCategoryDocument>('SubCategory', subCategorySchema)