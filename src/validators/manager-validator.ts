import {
	confirmOrderSchema,
	cancelOrderSchema
} from '../schemas/manager-schema'

export const validateConfirmOrder = (context: any) => (
	confirmOrderSchema.validateAsync(context)
)

export const validateCancelOrder = (context: any) => (
	cancelOrderSchema.validateAsync(context)
)