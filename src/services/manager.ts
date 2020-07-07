import { Order } from '../models'

export const getOrderById = (orderId: string) => (
	Order.findById(orderId)
)

export const updateOrderStatus = (orderId: string, status: boolean, result: string) => {
	if (status) {
		return Order.findByIdAndUpdate(orderId, { status, trackingNumber: result }, { new: true })
	} else {
		return Order.findByIdAndUpdate(orderId, { status, cancellationReason: result }, { new: true })
	}
}