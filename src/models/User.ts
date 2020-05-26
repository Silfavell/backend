// eslint-disable-next-line no-unused-vars
import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

// eslint-disable-next-line no-unused-vars
import Address, { AddressDocument } from './Address'

export type UserDocument = Document & {
	phoneNumber: string,
	nameSurname: string,
	email: string,
	password: string,
	addresses: AddressDocument[],
	cardUserKey: string
}

const userSchema = new Schema({
	phoneNumber: {
		type: String,
		required: true,
		unique: true
	},
	nameSurname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	addresses: [Address.schema],
	cardUserKey: {
		type: String,
		default: null
	}
	// cart: {}
}, {
	timestamps: true
})

// eslint-disable-next-line func-names, consistent-return
userSchema.pre('save', function (next) { // do not update.
	const user = this
	if (!user.isModified('password')) return next()

	// @ts-ignore
	bcrypt.hash(user.password, 10).then((hash) => {
		// @ts-ignore
		user.password = hash
		next()
	})
})


export default mongoose.model<UserDocument>('User', userSchema)