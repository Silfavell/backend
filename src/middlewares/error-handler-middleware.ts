import HttpStatusCodes from 'http-status-codes'
import { Request, Response } from 'express'
import winston from 'winston'

import ErrorMessages from '../errors/ErrorMessages'

export default (error: Error | any, req: Request, res: Response) => {
	winston.loggers.get('logger').error('', error)

	if (error.httpCode === HttpStatusCodes.INTERNAL_SERVER_ERROR || !error.httpCode) {
		winston.loggers.get('error-logger').error('', error)
	}

	res.status(error.httpCode ?? HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
		error: error.httpCode === HttpStatusCodes.INTERNAL_SERVER_ERROR ? ErrorMessages.UNEXPECTED_ERROR : error.name
	})
}