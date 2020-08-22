import { Order } from '../models'
import OrderStatus from '../enums/order-status-enum';

export const updateOrderStatus = (orderId: string, status: number, message?: string) => {
	switch (status) {
		case OrderStatus.APPROVED:
		case OrderStatus.CANCELED:
		case OrderStatus.RETURN_DENIED: return Order.findByIdAndUpdate(orderId, { status, message }, { new: true })
		default: return Order.findByIdAndUpdate(orderId, { status }, { new: true })
	}
}