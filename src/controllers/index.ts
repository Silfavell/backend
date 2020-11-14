import { Router } from 'express'
import path from 'path'

import auth from './auth/auth.controller'
import product from './product/product.controller'
import category from './category/category.controller'
import card from './card/card.controller'
import comment from './comments/comments.controller'
import order from './order/order.controller'
import cart from './cart/cart.controller'
import type from './type/type.controller'
import manager from './manager/manager.controller'
import admin from './admin/admin.controller'
import log from './log/log.controller'
import ticket from './ticket/ticket.controller'

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