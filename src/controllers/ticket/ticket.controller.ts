import { Router } from 'express'

import {
    getTickets,
    saveTicket
} from './ticket.service'

import {
    postTicketSchema
} from './ticket.validator'

import { handleError } from '../../utils/handle-error'

const router = Router()

router.post('/', async (req, res, next) => {
    try {
        await postTicketSchema.validateAsync(req.body)
        const ticket = await saveTicket(req.body)

        res.json(ticket)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

router.get('/all', async (req, res, next) => {
    try {
        const tickets = await getTickets()

        res.json(tickets)
    } catch (error) {
        next(handleError(error, req.protocol + '://' + req.get('host') + req.originalUrl))
    }
})

export default router