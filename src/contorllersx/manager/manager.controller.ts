import { Router } from 'express'

import {
    Manager
} from '../../models'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import {
    verifyManager,
    unverifyManager,
    deleteManager
} from '../../services/admin'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/requests', async (_, res) => {
    const managerRequests = await Manager.find({ verified: false })

    res.json(managerRequests)
})

router.get('/', async (_, res) => {
    const allManagers = await Manager.find()

    res.json(allManagers)
})

router.put('/verify-manager/:_id', async (req, res) => {
    const manager = await verifyManager(req.params._id)

    res.json(manager)
})

router.put('/unverify-manager/:_id', async (req, res) => {
    const manager = await unverifyManager(req.params._id)

    res.json(manager)
})

router.delete('/delete-manager/:_id', async (req, res) => {
    const manager = await deleteManager(req.params._id)

    res.json(manager)
})

export default router