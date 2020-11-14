import { Router } from 'express'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import {
    verifyManager,
    unverifyManager,
    deleteManager,
    allManagers,
    managerRequests
} from './manager.service'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/requests', async (_, res) => {
    res.json(await managerRequests())
})

router.get('/', async (_, res) => {
    res.json(await allManagers())
})

router.put('/verify-manager/:_id', async (req, res) => {
    res.json(await verifyManager(req.params._id))
})

router.put('/unverify-manager/:_id', async (req, res) => {
    res.json(await unverifyManager(req.params._id))
})

router.delete('/delete-manager/:_id', async (req, res) => {
    res.json(await deleteManager(req.params._id))
})

export default router