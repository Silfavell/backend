// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'

export type TicketDocument = Document & {
    name: string,
    surname: string,
    email: string,
    subject: string,
    message: string
}

const ticketSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

export default mongoose.model<TicketDocument>('Ticket', ticketSchema)