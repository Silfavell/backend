import { Redis } from '../startup'
import {
	Order,
	// eslint-disable-next-line no-unused-vars
	OrderDocument
} from '../models'

export const getOrderById = (orderId: string) => (
	Redis.getInstance.hgetAsync('orders', orderId)
)

export const updateOrderStatus = (orderId: string, status: boolean) => (
	Order.findByIdAndUpdate(orderId, { status }, { new: true })
)

export const saveOrderToCache = (order: OrderDocument) => (
	Redis.getInstance.hsetAsync('orders', order._id.toString(), JSON.stringify(order))
)