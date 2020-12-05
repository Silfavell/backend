import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from 'http-status-codes'

import Authority from '../enums/authority-enum'
import { Admin, User } from '../models'

export const validateAuthority = (authority?: Authority) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		const decoded: any = jwt.verify(req.headers.authorization, process.env.SECRET)

		if (decoded) {
			if (authority === Authority.ADMIN) {
				const admin = await Admin.findById(decoded.payload._id)

				if (admin) {
					req.admin = admin
					next()
				} else {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				}
			} else {
				const user = await User.findOne({ phoneNumber: decoded.payload.phoneNumber })
				req.user = user

				if (authority === Authority.USER && !user) {
					res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
				}

				next()
			}
		} else {
			if (authority) {
				res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
			}

			next()
		}
	} catch (error) {
		if (authority) {
			res.status(HttpStatusCodes.UNAUTHORIZED).end('Unauthorized')
		}

		next()
	}
}
