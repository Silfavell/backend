import { Router } from 'express'

import { Redis } from '../startup'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import { getOrderById, updateOrderStatus, saveOrderToCache } from '../services/manager'
// eslint-disable-next-line no-unused-vars
import { handleError, sendSms } from '../services/unauthorized'
import { validateCancelOrder, validateConfirmOrder } from '../validators/manager-validator'

const router = Router()

router.use(validateAuthority(Authority.MANAGER))

router.get('/orders', (req, res, next) => {
	// Redis.getInstance.del('orders')
	Redis.getInstance
		.hgetallAsync('orders')
		.then((orders) => {
			res.json(orders ?? {})
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /manager/orders'))
		})
})

router.get('/order/:_id', (req, res, next) => {
	getOrderById(req.params._id)
		.then((order) => {
			res.json(JSON.parse(order))
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /manager/order/:_id'))
		})
})

router.put('/orders/cancel/:_id', (req, res, next) => {
	validateCancelOrder(req.body)
		.then(() => updateOrderStatus(req.params._id, false))
		.then((order) => saveOrderToCache(order).then(() => order))
		.then((order) => {
			// sendSms(order.phoneNumber, `${order.date} Tarihinde verdiğiniz sipariş, ${req.body.cancellationReason} nedeniyle iptal edilmiştir. Ödemeniz en kısa sürece hesabına geri aktarılacaktır. Anlayışınız için teşekkürler.`)
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /orders/confirm/:_id'))
		})
})

router.put('/orders/confirm/:_id', (req, res, next) => {
	validateConfirmOrder(req.body)
		.then(() => updateOrderStatus(req.params._id, true))
		.then((order) => saveOrderToCache(order).then(() => order))
		.then((order) => {
			// sendSms(order.phoneNumber, `${order.date} Tarihinde verdiğiniz sipariş, Yurtiçi Kargoya verilmiştir, Kargo takip numarası : ${req.body.trackingNumber}`)
			res.json(order)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /orders/confirm/:_id'))
		})
})

export default router