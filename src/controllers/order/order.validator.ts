import Joi from '@hapi/joi'
import HttpStatusCodes from 'http-status-codes'

import ErrorMessages from '../../errors/ErrorMessages'
import ServerError from '../../errors/ServerError'
import { Order } from '../../models'

export const isOrderBelongsToUser = async (orderId: string, userPhone: string) => {
	const { phoneNumber } = await Order.findById(orderId)

	if (phoneNumber !== userPhone) {
		throw new ServerError(ErrorMessages.NO_PERMISSION, HttpStatusCodes.FORBIDDEN, ErrorMessages.NO_PERMISSION, false)
	}
}

export const confirmOrderSchema = Joi.object({
	message: Joi.string().length(12).required()
})

export const cancelOrderSchema = Joi.object({
	message: Joi.string().min(10).required()
})

export const cancelReturnSchema = Joi.object({
	message: Joi.string().min(10).required()
})

export const confirmReturnSchema = Joi.object({

})

export const makeOrderSchema = Joi.object({
	address: Joi.string().required(),
	card: Joi.string().required()
})

export const returnItemsSchema = Joi.array().min(1).items(
	Joi.object({
		_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
		quantity: Joi.number().positive().required()
	})
).sparse(false)
	.required()
