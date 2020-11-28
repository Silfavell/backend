import bcrypt from 'bcrypt'
import HttpStatusCodes from 'http-status-codes'
import JoiBase from '@hapi/joi'
import JoiPhoneNumber from 'joi-phone-number'

import { User, Admin } from '../../models'
import ServerError from '../../errors/ServerError'
import ErrorMessages from '../../errors/ErrorMessages'
import ActivationCodes from '../../enums/activation-code-enum'
import ActivationCode from '../../models/ActivationCode'

const Joi = JoiBase.extend(JoiPhoneNumber)

export const comparePasswords = async (oldPassword: string, newPassword: string) => {
	const validPassword = await bcrypt.compare(newPassword, oldPassword)

	if (!validPassword) {
		throw new ServerError(ErrorMessages.WRONG_PHONE_OR_PASSWORD, HttpStatusCodes.UNAUTHORIZED, null, false)
	}
}

/** If User not exists, throws Error. */
export const isAdminExists = async (phoneNumber: string) => {
	const admin = await Admin.findOne({ phoneNumber })

	if (!admin) {
		throw new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.UNEXPECTED_ERROR, false)
	}

	return admin
}

/** If User exists, throws Error. */
export const isUserNonExists = async (phoneNumber: string) => {
	const user = await User.findOne({ phoneNumber })

	if (user) {
		throw new ServerError(ErrorMessages.USER_ALREADY_EXISTS, HttpStatusCodes.BAD_REQUEST, null, false)
	}
}

/** If User exists, returns It else throws Error. */
export const isUserExists = async (phoneNumber: string) => {
	const user = await User.findOne({ phoneNumber })
	if (!user) {
		throw new ServerError(ErrorMessages.USER_IS_NOT_EXISTS, HttpStatusCodes.UNAUTHORIZED, ErrorMessages.USER_IS_NOT_EXISTS, false)
	}

	return user
}

/** Returns activation code of phoneNumber from Redis */
export const getActivationCode = async (phoneNumber: string, activationCodeType: ActivationCodes) => {
	const activationCodeObj = await ActivationCode.findOne({
		userPhoneNumber: phoneNumber,
		activationCodeType
	})

	if (!activationCodeObj) {
		throw new ServerError(ErrorMessages.UNKNOWN_ACTIVATION_CODE, HttpStatusCodes.BAD_REQUEST, ErrorMessages.UNKNOWN_ACTIVATION_CODE, false)
	}

	return activationCodeObj.activationCode
}

/** Tests equality of activationCode from request and from Redis */
export const compareActivationCode = async (activationCodeFromRequest: string, correctActivationCode: string) => {
	if (activationCodeFromRequest !== correctActivationCode) {
		throw new ServerError(ErrorMessages.WRONG_ACTIVATION_CODE, HttpStatusCodes.BAD_REQUEST, ErrorMessages.WRONG_ACTIVATION_CODE, false)
	}
}

export const sendActivationCodeSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	activationCodeType: Joi.number().min(0).max(4).required()
})

export const registerSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	nameSurname: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})

export const loginSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	password: Joi.string().min(4).required()
})

export const resetPasswordSchema = Joi.object({
	phoneNumber: Joi.string().phoneNumber({ defaultCountry: 'TR', format: 'national', strict: true }).required(),
	newPassword: Joi.string().min(4).required(),
	activationCode: Joi.number().min(1000).max(9999).required()
})