import { Router } from 'express'

import {
    Admin
} from '../../models'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { createToken } from '../../services/unauthorized'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/test', (req, res) => {
	res.json({ status: true })
})

router.post('/save', async (req, res) => {
    const admin = await new Admin(req.body).save()
    const token = await createToken(admin)

    res.end(token)
})

export default router