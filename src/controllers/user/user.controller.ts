import { Router } from 'express'

import {
	changePassword,
	updateUser,
	deleteAddress,
	saveAddressToDatabase,
	updatePhoneNumber
} from './user.service'

import {
	compareActivationCode,
	comparePasswords,
	getActivationCode,
	isUserExists
} from '../auth/auth.validator'

import {
	updateProfileSchema,
	saveAddressSchema,
	changePasswordSchema,
	updatePhoneNumberSchema,
} from './user.validator'
import ActivationCodes from '../../enums/activation-code-enum'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/profile', validateAuthority(), async (req, res, next) => {
	try {
		const user = await isUserExists(req.user.phoneNumber)

		res.json(user)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/profile', validateAuthority(), async (req, res, next) => {
	try {
		await updateProfileSchema.validateAsync(req.body)
		const user = await updateUser(req.user._id, req.body)

		res.json(user)
	} catch (error) {
			next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
		}
})

router.post('/address', validateAuthority(), async (req, res, next) => {
	try {
		await saveAddressSchema.validateAsync(req.body)
		const user = await saveAddressToDatabase(req.user._id, req.body)

		res.json(user)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.delete('/address/:_id', validateAuthority(), async (req, res, next) => {
	try {
		const user = await deleteAddress(req.user._id, req.params._id)

		res.json(user)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/change-password', validateAuthority(), async (req, res, next) => {
	try {
		await Promise.all([changePasswordSchema.validateAsync(req.body), comparePasswords(req.user.password, req.body.oldPassword)])
		const user = await isUserExists(req.user.phoneNumber)
		await changePassword(user, req.body.newPassword)

		res.json()
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/phone-number', validateAuthority(), async (req, res, next) => {
	try {
		const { newPhoneNumber } = await updatePhoneNumberSchema.validateAsync(req.body)
		const activationCode = await getActivationCode(newPhoneNumber, ActivationCodes.UPDATE_PHONE_NUMBER)

		await compareActivationCode(req.body.activationCode.toString(), activationCode.toString())
		await updatePhoneNumber(req.user.phoneNumber, newPhoneNumber)
		res.json()
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router