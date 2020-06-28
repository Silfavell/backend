import {
	confirmOrderSchema,
	cancelOrderSchema
} from '../schemas/manager-schema'

export const validateConfirmOrder = (body: any) => confirmOrderSchema.validateAsync(body)

export const validateCancelOrder = (body: any) => cancelOrderSchema.validateAsync(body)