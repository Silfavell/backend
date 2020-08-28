import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'
import { Manager, Admin, User } from '../models'
import { validatePhoneNumber } from '../validators/user-validator'

import ServerError from '../errors/ServerError'
import ErrorMessages from '../errors/ErrorMessages'

export const validateAuthority = (authority: Authority) => (req: Request, res: Response, next: NextFunction) => {
	if (authority === Authority.ANONIM) {
		if (req.headers.authorization) {
			try {
				const decoded: any = jwt.verify(req.headers.authorization, process.env.SECRET)

				if (decoded?.payload?.phoneNumber) {
					User.findOne({ phoneNumber: decoded.payload.phoneNumber }).then((user) => {
						req.user = user
						next()
					})
				} else {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				}
			} catch (error) {
				res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
			}
		} else {
			req.user = null
			next()
		}
	} else if (req.headers.authorization) {
		try {
			const decoded: any = jwt.verify(req.headers.authorization, process.env.SECRET)
			if (decoded) {
				if (authority === Authority.USER) {
					User.findOne({ phoneNumber: decoded.payload.phoneNumber }).then((user) => {
						if (user) {
							req.user = user
							next()
						} else {
							res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
						}
					})
				} else if (authority === Authority.MANAGER) {
					Manager.findById(decoded.payload._id).then((manager) => {
						if (manager) {
							req.manager = manager
							next()
						} else {
							res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
						}

					})
				} else if (authority === Authority.ADMIN) {
					Admin.findById(decoded.payload._id).then((admin) => {
						if (admin) {
							req.admin = admin
							next()
						} else {
							res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
						}
					})
				}
			} else {
				res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
			}
		} catch (error) {
			res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
		}
	} else {
		res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
	}
}

export const validatePhone = () => (req: Request, res: Response, next: NextFunction) => {
	const { value, error } = validatePhoneNumber({ phoneNumber: req.body.phoneNumber })

	if (!error) {
		if (value.phoneNumber) {
			req.body.phoneNumber = value.phoneNumber
		}
		next()
	} else {
		next(new ServerError(ErrorMessages.INVALID_PHONE_NUMBER, HttpStatusCodes.BAD_REQUEST, ErrorMessages.INVALID_PHONE_NUMBER, false))
	}
}