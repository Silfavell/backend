/**
 * /cart endpoint
 */

import { Router } from 'express'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

import {
    saveCart,
    clearCart,
    getCart
} from './cart.service'

import {
    validateProductIds,
    validateProducts
} from './cart.validator'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.post('/', async (req, res) => {
    await Promise.all([validateProducts(req.body), validateProductIds(req.body)])
    const response = await saveCart(req.user._id, req.body)

    res.json(response)
})

router.delete('/', async (req, res) => {
    await clearCart(req.user._id.toString())

    res.json()
})

router.get('/', async (req, res) => {
    const cart = await getCart(req.user._id.toString())

    res.json({ cart })
})


export default router