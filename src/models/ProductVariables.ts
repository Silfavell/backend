import mongoose, { Document, Schema } from 'mongoose'

export type ProductVariablesDocument = Document & {
    productId: mongoose.Types.ObjectId,
    timesSold: number,
    timesSearched: number,
    comments: [{
        ownerId: mongoose.Types.ObjectId,
        ownerName: string,
        comment: string,
        score: number,
        date: Date
    }]
}

const productVariables = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
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
            ownerAlias: {
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
            },
            date: {
                type: Date,
                required: true,
                default: Date.now()
            }
        }],
        required: true,
        default: []
    }
})

export default mongoose.model<ProductVariablesDocument>('ProductVariables', productVariables)