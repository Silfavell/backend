import { Order } from '../models'
import OrderStatus from '../enums/order-status-enum';

export const updateOrderStatus = (orderId: string, status: number, message?: string) => {
	switch (status) {
		case OrderStatus.APPROVED: return Order.findByIdAndUpdate(orderId, { status, message }, { new: true })
		case OrderStatus.CANCELED: return Order.findByIdAndUpdate(orderId, { status, message }, { new: true })
		default: return Order.findByIdAndUpdate(orderId, { status }, { new: true })
	}
}