// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type ProductSpecificationDocument = Document & {
    name: string,
    slug: string,
    value: string
}

const productSpecificationSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
})

export default mongoose.model<ProductSpecificationDocument>('ProductSpecification', productSpecificationSchema)