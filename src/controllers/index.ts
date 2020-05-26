import { Router } from 'express'

import unauthorized from './unauthorized'
import user from './user'
import manager from './manager'
import admin from './admin'

const router = Router()

router.use('/', unauthorized)
router.use('/user', user)
router.use('/manager', manager)
router.use('/admin', admin)

export default router