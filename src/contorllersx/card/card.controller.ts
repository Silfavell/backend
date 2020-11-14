import { Router } from 'express'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

import {
    listCards,
    addCardToUser,
    deleteCard
} from '../../services/user'

import {
    validatePostPaymentCardRequest,
    validateDeletePaymentCardRequest
} from '../../validators/user-validator'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/list-cards', async (req, res) => {
    const cards = await listCards(req.user.cardUserKey)

    res.json(cards)
})

router.post('/payment-card', async (req, res) => {
    await validatePostPaymentCardRequest(req.body.card)
    const response = await addCardToUser(req.user, req.body.card)

    res.json(response)
})

router.put('/payment-card', async (req, res) => {
    await validateDeletePaymentCardRequest(req.body)
    const response = await deleteCard(req.user, req.body.cardToken)

    res.json(response)
})

export default router