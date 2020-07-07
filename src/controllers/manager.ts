import { Router } from 'express'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import { getOrderById, updateOrderStatus } from '../services/manager'
// eslint-disable-next-line no-unused-vars
import { handleError, sendSms } from '../services/unauthorized'
import { validateCancelOrder, validateConfirmOrder } from '../validators/manager-validator'
import { Order } from '../models'

const router = Router()

router.use(validateAuthority(Authority.MANAGER))

router.get('/orders', (req, res, next) => {
	Order.find().then((orders) => {
		res.json(orders ?? {})
	}).catch((reason) => {
		next(handleError(reason, 'GET /manager/orders'))
	})
})

router.get('/order/:_id', (req, res, next) => {
	getOrderById(req.params._id)
		.then((order) => {
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /manager/order/:_id'))
		})
})

router.put('/orders/cancel/:_id', (req, res, next) => {
	validateCancelOrder(req.body)
		.then(() => updateOrderStatus(req.params._id, false, req.body.cancellationReason))
		.then((order) => {
			// sendSms(order.phoneNumber, `${order.date} Tarihinde verdiğiniz sipariş, ${req.body.cancellationReason} nedeniyle iptal edilmiştir. Ödemeniz en kısa sürece hesabına geri aktarılacaktır. Anlayışınız için teşekkürler.`)
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /manager/orders/confirm/:_id'))
		})
})

router.put('/orders/confirm/:_id', (req, res, next) => {
	validateConfirmOrder(req.body)
		.then(() => updateOrderStatus(req.params._id, true, req.body.trackingNumber))
		.then((order) => {
			// sendSms(order.phoneNumber, `${order.date} Tarihinde verdiğiniz sipariş, Yurtiçi Kargoya verilmiştir, Kargo takip numarası : ${req.body.trackingNumber}`)
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /manager/orders/confirm/:_id'))
		})
})

export default router