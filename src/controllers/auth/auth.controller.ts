import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import rateLimit from 'express-rate-limit'

import {
	registerUser,
	createActivationCode,
	login,
	checkConvenientOfActivationCodeRequest,
	createToken
} from './auth.service'

import {
	isUserNonExists,
	isUserExists,
	getActivationCode,
	compareActivationCode,
	isAdminExists,

	sendActivationCodeSchema,
	registerSchema,
	loginSchema,
	resetPasswordSchema
} from './auth.validator'

import ActivationCodes from '../../enums/activation-code-enum'
import { validateAuthority } from '../../middlewares/auth-middleware'
import { handleError } from '../../utils/handle-error'
import { sendSms } from '../../utils/send-sms'

const apiLimiter = rateLimit({
	windowMs: 6 * 60 * 60 * 1000, // 6 Hours
	max: 5
})

const router = Router()

router.use(apiLimiter)

router.post('/send-activation-code', validateAuthority(), async (req, res, next) => {
	try {
		await Promise.all([
			sendActivationCodeSchema.validateAsync({ phoneNumber: req.body.phoneNumber, activationCodeType: req.body.activationCodeType }),
			checkConvenientOfActivationCodeRequest(req.body.phoneNumber, req.body.activationCodeType)
		])
		const activationCode = await createActivationCode(req.body.phoneNumber, req.body.activationCodeType)
		sendSms(`9${req.body.phoneNumber.split(' ').join('')}`, `Silfavell Onay kodunuz: ${activationCode}`)

		res.status(HttpStatusCodes.ACCEPTED).json()
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/register', validateAuthority(), async (req, res, next) => {
	try {
		await Promise.all([registerSchema.validateAsync(req.body), isUserNonExists(req.body.phoneNumber)])
		const activationCode = await getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_USER)
		await compareActivationCode(req.body.activationCode, activationCode.toString())
		const user = await registerUser(req.body)
		const token = await createToken(user)

		res.json({ user, token })
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/login-admin', validateAuthority(), async (req, res, next) => {
	try {
		await loginSchema.validateAsync(req.body)
		const admin = await isAdminExists(req.body.phoneNumber)
		await login(admin, req.body.password)
		const token = await createToken(admin)

		res.json({ admin, token })
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/login', validateAuthority(), async (req, res, next) => {
	try {
		await loginSchema.validateAsync(req.body)
		const user = await isUserExists(req.body.phoneNumber)
		await login(user, req.body.password)
		const token = await createToken(user)

		res.json({ user, token })
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/reset-password', validateAuthority(), async (req, res, next) => {
	try {
		await resetPasswordSchema.validateAsync(req.body)
		await isUserExists(req.body.phoneNumber)
		const activationCode = await getActivationCode(req.body.phoneNumber, ActivationCodes.RESET_PASSWORD)
		await compareActivationCode(req.body.activationCode, activationCode.toString())
		await isUserExists(req.body.phoneNumber)

		res.json()
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router