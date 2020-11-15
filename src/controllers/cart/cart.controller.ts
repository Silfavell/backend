/**
 * /cart endpoint
 */

import { Router } from 'express'

import {
    saveCart,
    clearCart,
    getCart
} from './cart.service'

import {
    validateProductIds,
    validateProducts
} from './cart.validator'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.post('/', async (req, res, next) => {
    try {
        await Promise.all([validateProducts(req.body), validateProductIds(req.body)])
        const response = await saveCart(req.user._id, req.body)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.delete('/', async (req, res, next) => {
    try {
        await clearCart(req.user._id.toString())

        res.json()
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.get('/', async (req, res, next) => {
    try {
        const cart = await getCart(req.user._id.toString())

        res.json({ cart })
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})


export default router