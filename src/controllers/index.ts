import { Router } from 'express'
import path from 'path'

import auth from './auth/auth.controller'
import user from './user/user.controller'
import product from './product/product.controller'
import category from './category/category.controller'
import card from './card/card.controller'
import comment from './comments/comments.controller'
import order from './order/order.controller'
import cart from './cart/cart.controller'
import type from './type/type.controller'
import admin from './admin/admin.controller'
import log from './log/log.controller'
import ticket from './ticket/ticket.controller'
import mobile from './mobile/mobile.controller'

const router = Router()

router.use('/auth', auth)
router.use('/user', user)
router.use('/products', product)
router.use('/categories', category)
router.use('/cards', card)
router.use('/comments', comment)
router.use('/orders', order)
router.use('/cart', cart)
router.use('/types', type)
router.use('/admin', admin)
router.use('/logs', log)
router.use('/tickets', ticket)
router.use('/mobile', mobile)

router.get('/static', (req, res, next) => {
	res.sendFile(path.join(__dirname, `../../public/assets/${req.query.folder}/${req.query.image}`))
})

export default router