import { Ticket } from '../../models'


export const getTickets = () => (
	Ticket.find()
)

export const saveTicket = (body: any) => (
	new Ticket(body).save()
)