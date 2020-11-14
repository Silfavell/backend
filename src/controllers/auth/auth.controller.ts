import { Router } from 'express'
import HttpStatusCodes from 'http-status-codes'
import rateLimit from 'express-rate-limit'

import {
    registerUser,
    registerManager,
    createActivationCode,
    login,
    isManagerVerified,
    checkConvenientOfActivationCodeRequest,
    createToken
} from './auth.service'

import {
    isUserNonExists,
    isUserExists,
    getActivationCode,
    compareActivationCode,
    isManagerNonExists,
    isManagerExists,

    sendActivationCodeSchema,
    registerSchema,
    registerManagerSchema,
    loginSchema,
    resetPasswordSchema
} from './auth.validator'

import ActivationCodes from '../../enums/activation-code-enum'

const apiLimiter = rateLimit({
    windowMs: 6 * 60 * 60 * 1000, // 6 Hours
    max: 5
})

const router = Router()

router.post('/send-activation-code', async (req, res) => {
    await Promise.all([
        sendActivationCodeSchema.validateAsync({ phoneNumber: req.body.phoneNumber, activationCodeType: req.body.activationCodeType }),
        checkConvenientOfActivationCodeRequest(req.body.phoneNumber, req.body.activationCodeType)
    ])
    await createActivationCode(req.body.phoneNumber, req.body.activationCodeType)

    res.status(HttpStatusCodes.ACCEPTED).json()
})

router.post('/register', async (req, res) => {
    await Promise.all([registerSchema.validateAsync(req.body), isUserNonExists(req.body.phoneNumber)])
    const activationCode = getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_USER)
    await compareActivationCode(req.body.activationCode, activationCode.toString())
    const user = await registerUser(req.body)
    const token = await createToken(user)

    res.json({ user, token })
})

router.post('/register-manager', async (req, res) => {
    await Promise.all([registerManagerSchema.validateAsync(req.body), isManagerNonExists(req.body.phoneNumber)])
    const activationCode = await getActivationCode(req.body.phoneNumber, ActivationCodes.REGISTER_MANAGER)
    await compareActivationCode(req.body.activationCode, activationCode.toString())
    await registerManager({ ...req.body, ...{ verified: false } })

    res.json()
})

router.post('/login-manager', apiLimiter, async (req, res) => {
    await loginSchema.validateAsync(req.body)
    const manager = await isManagerExists(req.body.phoneNumber)
    await login(manager, req.body.password)
    await isManagerVerified(manager)
    const token = await createToken(manager)

    res.json({ manager, token })
})

router.post('/login', async (req, res) => {
    await loginSchema.validateAsync(req.body)
    const user = await isUserExists(req.body.phoneNumber)
    await login(user, req.body.password)
    const token = await createToken(user)

    res.json({ user, token })
})

router.put('/reset-password', async (req, res) => {
    await resetPasswordSchema.validateAsync(req.body)
    await isUserExists(req.body.phoneNumber)
    const activationCode = await getActivationCode(req.body.phoneNumber, ActivationCodes.RESET_PASSWORD)
    await compareActivationCode(req.body.activationCode, activationCode.toString())
    await isUserExists(req.body.phoneNumber)

    res.json()
})

export default router