import mongoose, { Document, Schema } from 'mongoose'
import Brand, { BrandDocument } from './Brand'

export type SubCategoryDocument = Document & {
	name: string;
	slug: string;
	types: [Schema.Types.ObjectId];
	brands: [BrandDocument];
}

const subCategorySchema = new Schema({
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true
	},
	types: {
		type: [Schema.Types.ObjectId],
		default: []
	},
	brands: [Brand.schema]
})

export default mongoose.model<SubCategoryDocument>('SubCategory', subCategorySchema)