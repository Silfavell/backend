import { Router } from 'express'
import { getTickets } from '../services/admin'

import {
    saveTicket
} from '../services/unauthorized'

import {
    validatePostTicketRequest
} from '../validators/unauthorized-validator'

const router = Router()

router.post('/', async (req, res) => {
    await validatePostTicketRequest(req.body)
    const ticket = await saveTicket(req.body)

    res.json(ticket)
})

router.get('/all', async (_, res,) => {
    const tickets = await getTickets()

    res.json(tickets)
})

export default router