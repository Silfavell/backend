import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export type AdminDocument = Document & {
	phoneNumber: string,
	nameSurname: string,
	email: string,
	password: string
}

const adminSchema = new Schema({
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
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	}
})

// eslint-disable-next-line func-names, consistent-return
adminSchema.pre('save', function (next) { // do not update.
	const admin = this as AdminDocument
	if (!admin.isModified('password')) return next()

	bcrypt.hash(admin.password, 10).then((hash) => {
		admin.password = hash
		next()
	})
})


export default mongoose.model<AdminDocument>('Admin', adminSchema)