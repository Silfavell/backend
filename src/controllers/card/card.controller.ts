import { Router } from 'express'

import {
    listCards,
    addCardToUser,
    deleteCard
} from './card.service'

import {
    postPaymentCardSchema,
    deletePaymentCardSchema
} from './card.validator'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/', async (req, res, next) => {
    try {
        const cards = await listCards(req.user.cardUserKey)

        res.json(cards)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.post('/', async (req, res, next) => {
    try {
        await postPaymentCardSchema.validateAsync(req.body.card)
        const response = await addCardToUser(req.user, req.body.card)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.delete('/:cardToken', async (req, res, next) => {
    try {
        await deletePaymentCardSchema.validateAsync(req.params)
        const response = await deleteCard(req.user, req.params.cardToken)

        res.json(response)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

export default router