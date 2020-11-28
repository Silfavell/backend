/**
 * /orders endpoint
 */

import { Router } from 'express'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

import {
	saveOrderToDatabase,
	updateProductsSoldTimes,
	getOrders,
	getAllOrders,
	completePayment,
	checkMakeOrderValues,
	clearCart,
	getOrderById,
	returnItems,
	updateOrderStatus
} from './order.service'

import { sendSms } from '../../utils/send-sms'

import {
	isOrderBelongsToUser,

	cancelOrderSchema,
	confirmOrderSchema,
	cancelReturnSchema,
	confirmReturnSchema,
	makeOrderSchema,
	returnItemsSchema
} from './order.validator'

import OrderStatus from '../../enums/order-status-enum'
import { handleError } from '../../utils/handle-error'

const router = Router()

const getLocalDate = (date: Date) => (
	new Date(date).toLocaleDateString('tr-TR', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
)

router.post('/', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		await makeOrderSchema.validateAsync(req.body)
		const { cart, card, selectedAddress } = await checkMakeOrderValues(req.user, req.body)
		const result = await completePayment(req.user, cart, selectedAddress.openAddress, card)
		const order = await saveOrderToDatabase(req.user, cart, selectedAddress)
		await updateProductsSoldTimes(cart)
		await clearCart(req.user._id.toString())

		res.json({ cart, order, result })
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/:orderId', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		const order = (await getOrderById(req.params.orderId))[0]
		await isOrderBelongsToUser(req.params.orderId, req.user.phoneNumber)

		res.json(order)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/return-items/:orderId', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		await returnItemsSchema.validateAsync(req.body)
		await isOrderBelongsToUser(req.params.orderId, req.user.phoneNumber)
		const response = await returnItems(req.params.orderId, req.body)

		res.json(response)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})


router.get('/', validateAuthority(Authority.USER), async (req, res, next) => {
	try {
		const orders = await getOrders(req.user.phoneNumber)

		res.json(orders)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/all', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		const orders = getAllOrders()

		res.json(orders)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/:orderId', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		const order = (await getOrderById(req.params.orderId))[0]

		res.json(order)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/cancel/:orderId', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await cancelOrderSchema.validateAsync(req.body)
		const order = await updateOrderStatus(req.params.orderId, OrderStatus.CANCELED, req.body.message)

		// TODO PUSH NOTIFICATION
		sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz siparis, ${req.body.message} nedeniyle iptal edilmistir. Odemeniz en kisa surede hesabiniza geri aktarilacaktır. Anlayisiniz için tesekkurler.`)
		res.json(order)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/confirm/:orderId', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await confirmOrderSchema.validateAsync(req.body)
		const order = await updateOrderStatus(req.params.orderId, OrderStatus.APPROVED, req.body.message)

		// TODO PUSH NOTIFICATION
		sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz siparis, Yurtici Kargoya verilmistir, Kargo takip numarası : ${req.body.message}`)
		res.json(order)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/cancel-return/:orderId', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await cancelReturnSchema.validateAsync(req.body)
		const order = await updateOrderStatus(req.params.orderId, OrderStatus.RETURN_DENIED, req.body.message)

		// TODO PUSH NOTIFICATION
		sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz iade talebi, ${req.body.message} nedeniyle reddedilmistir edilmistir. Anlayisiniz icin tesekkurler.`) // TODO PUSH NOTIFICATION
		res.json(order)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/accept-return/:orderId', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await confirmReturnSchema.validateAsync(req.body)
		const order = await updateOrderStatus(req.params.orderId, OrderStatus.RETURN_ACCEPTED)

		// TODO PUSH NOTIFICATION
		sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz iade talebi onaylanmistir. Iade en kisa sure icerisinde hesabiniza aktarilacaktir.`) // TODO PUSH NOTIFICATION
		res.json(order)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router