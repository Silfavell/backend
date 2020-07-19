import { Router } from 'express'
import path from 'path'

import unauthorized from './unauthorized'
import user from './user'
import manager from './manager'
import admin from './admin'

const router = Router()

router.use('/', unauthorized)
router.use('/user', user)
router.use('/manager', manager)
router.use('/admin', admin)

router.get('/static', (req, res, next) => {
    res.sendFile(path.join(__dirname, `../../public/assets/${req.query.folder}/${req.query.image}`))
})

export default router