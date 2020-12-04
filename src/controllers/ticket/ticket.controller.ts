import { Router } from 'express'

import {
	getTickets,
	saveTicket
} from './ticket.service'

import {
	postTicketSchema
} from './ticket.validator'

import { handleError } from '../../utils/handle-error'
import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

const router = Router()

router.post('/', async (req, res, next) => {
	try {
		await postTicketSchema.validateAsync(req.body)
		const ticket = await saveTicket(req.body)

		res.json(ticket)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/all', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		const tickets = await getTickets()

		res.json(tickets)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router