import {
	Order,
	// eslint-disable-next-line no-unused-vars
	OrderDocument
} from '../models'

export const getOrderById = (orderId: string) => (
	Order.findById(orderId)
)

export const updateOrderStatus = (orderId: string, status: boolean) => (
	Order.findByIdAndUpdate(orderId, { status }, { new: true })
)