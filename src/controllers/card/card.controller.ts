import { Router } from 'express'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

import {
    listCards,
    addCardToUser,
    deleteCard
} from './card.service'

import {
    postPaymentCardSchema,
    deletePaymentCardSchema
} from './card.validator'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/list-cards', async (req, res) => {
    const cards = await listCards(req.user.cardUserKey)

    res.json(cards)
})

router.post('/payment-card', async (req, res) => {
    await postPaymentCardSchema.validateAsync(req.body.card)
    const response = await addCardToUser(req.user, req.body.card)

    res.json(response)
})

router.delete('/payment-card/:cardToken', async (req, res) => {
    await deletePaymentCardSchema.validateAsync(req.params)
    const response = await deleteCard(req.user, req.params.cardToken)

    res.json(response)
})

export default router