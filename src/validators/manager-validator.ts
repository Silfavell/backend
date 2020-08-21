import {
	confirmOrderSchema,
	cancelOrderSchema,
	cancelReturnSchema,
	confirmReturnSchema
} from '../schemas/manager-schema'

export const validateConfirmOrder = (body: any) => confirmOrderSchema.validateAsync(body)

export const validateCancelOrder = (body: any) => cancelOrderSchema.validateAsync(body)

export const validateCancelReturn = (body: any) => cancelReturnSchema.validateAsync(body)

export const validateConfirmReturn = (body: any) => confirmReturnSchema.validateAsync(body)