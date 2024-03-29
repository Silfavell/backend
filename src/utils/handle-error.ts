import HttpStatusCodes from 'http-status-codes'
import ServerError from '../errors/ServerError'

export const handleError = (error: any, path: string): Error => {
	if (error.httpCode) {
		return error
	} if (error.isJoi) {
		return new ServerError(error.message, HttpStatusCodes.BAD_REQUEST, path, false)
	}

	return new ServerError(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR, path, true)
}