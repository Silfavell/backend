import { Router } from 'express'

import {
    getTickets,
    saveTicket
} from './ticket.service'

import {
    postTicketSchema
} from './ticket.validator'

const router = Router()

router.post('/', async (req, res) => {
    await postTicketSchema.validateAsync(req.body)
    const ticket = await saveTicket(req.body)

    res.json(ticket)
})

router.get('/all', async (_, res,) => {
    const tickets = await getTickets()

    res.json(tickets)
})

export default router