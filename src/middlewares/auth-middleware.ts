/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'
import { Manager, Admin } from '../models'
import { validatePhoneNumber } from '../validators/user-validator'

import ServerError from '../errors/ServerError'
import { getUserFromCache } from '../services/user'

export const validateAuthority = (authority: Authority) => (req: Request, res: Response, next: NextFunction) => {
	if (authority === Authority.ANONIM) {
		if (req.headers.authorization) {
			const decoded: any = jwt.verify(req.headers.authorization, process.env.SECRET)

			if (decoded?.payload?.phoneNumber) {
				getUserFromCache(decoded.payload.phoneNumber).then((user) => {
					// @ts-ignore
					req.user = JSON.parse(user)
					next()
				})
			} else {
				res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
			}
		} else {
			// @ts-ignore
			req.user = null
			next()
		}
	} else if (req.headers.authorization) {
		try {
			const decoded: any = jwt.verify(req.headers.authorization, process.env.SECRET)
			if (decoded) {
				if (authority === Authority.USER) {
					getUserFromCache(decoded.payload.phoneNumber).then((user) => {
						if (user) {
							// @ts-ignore
							req.user = JSON.parse(user)
							next()
						} else {
							res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
						}
					})
				} else if (authority === Authority.MANAGER) {
					// @ts-ignore
					Manager.findById(decoded.payload._id).then((manager) => {
						if (manager) {
							// @ts-ignore
							req.manager = manager
							next()
						} else {
							res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
						}

					})
				} else if (authority === Authority.ADMIN) {
					Admin.findById(decoded.payload._id).then((admin) => {
						if (admin) {
							// @ts-ignore
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
		// @ts-ignore
		if (value.phoneNumber) {
			req.body.phoneNumber = value.phoneNumber
		}
		next()
	} else {
		next(new ServerError('Phone number is invalid.', HttpStatusCodes.BAD_REQUEST, 'Phone number is invalid.', false))
	}
}