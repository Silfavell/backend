import { Router } from 'express'
import path from 'path'

import auth from './auth'
import product from './product'
import category from './category'
import card from './card'
import comment from './comments'
import order from './order'
import cart from './cart'
import type from './type'
import manager from './manager'
import admin from './admin'
import log from './log'
import ticket from './ticket'

const router = Router()

router.use('/auth', auth)
router.use('/products', product)
router.use('/categories', category)
router.use('/card', card)
router.use('/comments', comment)
router.use('/orders', order)
router.use('/cart', cart)
router.use('/types', type)
router.use('/managers', manager)
router.use('/admins', admin)
router.use('/logs', log)
router.use('/tickets', ticket)

router.get('/static', (req, res) => {
    res.sendFile(path.join(__dirname, `../../public/assets/${req.query.folder}/${req.query.image}`))
})

export default router