import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

import Address, { AddressDocument } from './Address'

export type UserDocument = Document & {
	phoneNumber: string;
	nameSurname: string;
	alias?: string;
	email: string;
	password: string;
	favoriteProducts: string[];
	addresses: AddressDocument[];
	cardUserKey: string;
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
	alias: {
		type: String
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
	favoriteProducts: [{
		type: String,
		required: true
	}],
	cardUserKey: {
		type: String,
		default: null
	}
}, {
	timestamps: true
})

// eslint-disable-next-line func-names, consistent-return
userSchema.pre('save', function (next) { // do not update.
	const user = this as UserDocument
	if (!user.isModified('password')) return next()

	bcrypt.hash(user.password, 10).then((hash) => {
		user.password = hash
		next()
	})
})


export default mongoose.model<UserDocument>('User', userSchema)