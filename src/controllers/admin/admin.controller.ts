import { Router } from 'express'

import {
	Admin
} from '../../models'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { createToken } from '../auth/auth.service'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/test', (req, res, next) => {
	try {
		res.json({ status: true })
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/save', async (req, res, next) => {
	try {
		const admin = await new Admin(req.body).save()
		const token = await createToken(admin)

		res.end(token)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router