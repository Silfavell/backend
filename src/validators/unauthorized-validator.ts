import {
	sendActivationCodeSchema,
	registerSchema,
	registerManagerSchema,
	loginSchema,
	resetPasswordSchema
} from '../schemas/unauthorized-schema'

export const validateSendActivationCodeRequest = (context: any) => (
	sendActivationCodeSchema.validateAsync(context)
)

export const validateRegisterRequest = (context: any) => (
	registerSchema.validateAsync(context)
)

export const validateRegisterManagerRequest = (context: any) => (
	registerManagerSchema.validateAsync(context)
)

export const validateLoginRequest = (context: any) => (
	loginSchema.validateAsync(context)
)

export const validateResetPasswordRequest = (context: any) => (
	resetPasswordSchema.validateAsync(context)
)