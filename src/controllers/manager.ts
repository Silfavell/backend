import { Router } from 'express'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import { updateOrderStatus } from '../services/manager'
import { handleError, sendSms } from '../services/unauthorized'
import {
	validateCancelOrder,
	validateConfirmOrder,
	validateCancelReturn,
	validateConfirmReturn
} from '../validators/manager-validator'
import { Order } from '../models'
import { getOrderById } from '../services/user'
import OrderStatus from '../enums/order-status-enum'

const router = Router()

router.use(validateAuthority(Authority.MANAGER))

const getLocalDate = (date: Date) => (
	new Date(date).toLocaleDateString('tr-TR', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
)

router.get('/orders', (req, res, next) => {
	Order.find().sort({ _id: -1 }).then((orders) => {
		res.json(orders ?? [])
	}).catch((reason) => {
		next(handleError(reason, 'GET /manager/orders'))
	})
})

router.get('/order/:_id', (req, res, next) => {
	getOrderById(req.params._id)
		.then((order) => {
			res.json(order[0])
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /manager/order/:_id'))
		})
})

router.put('/orders/cancel/:_id', (req, res, next) => {
	validateCancelOrder(req.body)
		.then(() => updateOrderStatus(req.params._id, OrderStatus.CANCELED, req.body.message))
		.then((order) => {// TODO PUSH NOTIFICATION
			sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz siparis, ${req.body.message} nedeniyle iptal edilmistir. Odemeniz en kisa surede hesabiniza geri aktarilacaktır. Anlayisiniz için tesekkurler.`)
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /manager/orders/confirm/:_id'))
		})
})

router.put('/orders/confirm/:_id', (req, res, next) => {
	validateConfirmOrder(req.body)
		.then(() => updateOrderStatus(req.params._id, OrderStatus.APPROVED, req.body.message))
		.then((order) => {// TODO PUSH NOTIFICATION
			sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz siparis, Yurtici Kargoya verilmistir, Kargo takip numarası : ${req.body.message}`)
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /manager/orders/confirm/:_id'))
		})
})

router.put('/orders/cancel-return/:_id', (req, res, next) => {
	validateCancelReturn(req.body)
		.then(() => updateOrderStatus(req.params._id, OrderStatus.RETURN_DENIED, req.body.message))
		.then((order) => {
			sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz iade talebi, ${req.body.message} nedeniyle reddedilmistir edilmistir. Anlayisiniz icin tesekkurler.`) // TODO PUSH NOTIFICATION
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /manager/orders/cancel-return/:_id'))
		})
})

router.put('/orders/accept-return/:_id', (req, res, next) => {
	validateConfirmReturn(req.body)
		.then(() => updateOrderStatus(req.params._id, OrderStatus.RETURN_ACCEPTED))
		.then((order) => {
			sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz iade talebi onaylanmistir. Iade en kisa sure icerisinde hesabiniza aktarilacaktir.`) // TODO PUSH NOTIFICATION
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /manager/orders/confirm-return/:_id'))
		})
})

export default router