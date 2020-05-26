import HttpStatusCodes from 'http-status-codes'
// eslint-disable-next-line no-unused-vars
import { Request, Response, NextFunction } from 'express'
import winston from 'winston'
import ErrorMessages from '../errors/ErrorMessages'

// eslint-disable-next-line no-unused-vars
export default (error: Error | any, req: Request, res: Response, next: NextFunction) => {
	winston.loggers.get('logger').error('', error)

	if (error.httpCode === HttpStatusCodes.INTERNAL_SERVER_ERROR || !error.httpCode) {
		winston.loggers.get('error-logger').error('', error)
	}

	res.status(error.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
		error: error.httpCode === HttpStatusCodes.INTERNAL_SERVER_ERROR ? ErrorMessages.UNEXPECTED_ERROR : error.name
	})
}