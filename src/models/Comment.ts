import mongoose, { Document, Schema } from 'mongoose'

export type CommentDocument = Document & {
    productId: mongoose.Types.ObjectId,
    ownerId: mongoose.Types.ObjectId,
    ownerAlias: string,
    title: string,
    comment: string,
    rate: number,
    date: Date,
    verified: boolean
}

const commentSchema = new Schema({
    productId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    ownerId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    ownerAlias: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    },
    verified: {
        type: Boolean,
        required: true,
        default: false
    }
})

export default mongoose.model<CommentDocument>('Comment', commentSchema)