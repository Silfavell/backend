import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'
import { Manager, Admin, User } from '../models'

export const validateAuthority = (authority: Authority) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		const decoded: any = jwt.verify(req.headers.authorization, process.env.SECRET)

		if (decoded) {
			if (authority === Authority.USER) {
				const user = await User.findOne({ phoneNumber: decoded.payload.phoneNumber })

				if (user) {
					req.user = user
					next()
				} else {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				}
			} else if (authority === Authority.MANAGER) {
				const manager = await Manager.findById(decoded.payload._id)

				if (manager) {
					req.manager = manager
					next()
				} else {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				}
			} else if (authority === Authority.ADMIN) {
				const admin = await Admin.findById(decoded.payload._id)

				if (admin) {
					req.admin = admin
					next()
				} else {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				}
			}
		} else {
			res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
		}
	} catch (error) {
		res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
	}
}
