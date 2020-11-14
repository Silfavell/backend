/**
 * /cart endpoint
 */

import { Router } from 'express'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'

import {
    saveCart,
    clearCart,
    getCart,
    validateSaveCartProducts
} from '../services/user'

import {
    validateSaveCartRequest
} from '../validators/user-validator'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.post('/', async (req, res) => {
    await Promise.all([validateSaveCartRequest(req.body), validateSaveCartProducts(req.body)])
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