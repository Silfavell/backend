import mongoose, { Document, Schema } from 'mongoose'

export type ProductVariablesDocument = Document & {
    timesSold: number,
    timesSearched: number,
    comments: [{
        ownerId: mongoose.Types.ObjectId,
        ownerName: string,
        comment: string,
        score: number
    }]
}

const productVariables = new Schema({
    timesSold: {
        type: Number,
        required: true,
        default: 0
    },
    timesSearched: {
        type: Number,
        required: true,
        default: 0
    },
    comments: {
        type: [{
            ownerId: {
                type: mongoose.Types.ObjectId,
                required: true
            },
            ownerName: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            score: {
                type: Number,
                min: 1,
                max: 10,
                required: true
            }
        }],
        required: true,
        default: []
    }
})

export default mongoose.model<ProductVariablesDocument>('ProductVariables', productVariables)