import {
	productsFilterWithCategoriesSchema,
	sendActivationCodeSchema,
	registerSchema,
	registerManagerSchema,
	loginSchema,
	resetPasswordSchema
} from '../schemas/unauthorized-schema'

export const validateGetProductsFilterWithCategoriesRequest = (body: any) => productsFilterWithCategoriesSchema.validateAsync(body)

export const validateSendActivationCodeRequest = (body: any) => sendActivationCodeSchema.validateAsync(body)

export const validateRegisterRequest = (body: any) => registerSchema.validateAsync(body)

export const validateRegisterManagerRequest = (body: any) => registerManagerSchema.validateAsync(body)

export const validateLoginRequest = (body: any) => loginSchema.validateAsync(body)

export const validateResetPasswordRequest = (body: any) => resetPasswordSchema.validateAsync(body)