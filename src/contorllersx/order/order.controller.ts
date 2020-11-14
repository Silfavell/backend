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
    completePayment,
    checkMakeOrderValues,
    clearCart,
    getOrderById,
    returnItems,
    updateOrderStatus
} from './order.service'

import { sendSms } from '../../utils/send-sms'

import {
    cancelOrderSchema,
    confirmOrderSchema,
    cancelReturnSchema,
    confirmReturnSchema,
    makeOrderSchema,
    returnItemsSchema
} from './order.validator'

import { Order } from '../../models'
import OrderStatus from '../../enums/order-status-enum'

const router = Router()

const getLocalDate = (date: Date) => (
    new Date(date).toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
)

router.get('/', validateAuthority(Authority.ADMIN), async (req, res) => {
    const orders = await getOrders(req.user.phoneNumber)

    res.json(orders)
})

router.post('/own', validateAuthority(Authority.USER), async (req, res) => {
    await makeOrderSchema.validateAsync(req.body)
    const { cart, card, selectedAddress } = await checkMakeOrderValues(req.user, req.body)
    const result = await completePayment(req.user, cart, selectedAddress.openAddress, card)
    const order = await saveOrderToDatabase(req.user, cart, selectedAddress)
    await updateProductsSoldTimes(cart)
    await clearCart(req.user._id.toString())

    res.json({ cart, order, result })
})

router.get('/:_id', validateAuthority(Authority.USER), async (req, res) => {// TODO validate is order belongs to user by phoneNumber ?
    const order = (await getOrderById(req.params._id))[0]

    res.json(order)
})

router.post('/return-items/:orderId', validateAuthority(Authority.USER), async (req, res) => {// TODO validate is order belongs to user by phoneNumber ?
    await returnItemsSchema.validateAsync(req.body)
    const response = await returnItems(req.params.orderId, req.body)

    res.json(response)
})

router.get('/all', validateAuthority(Authority.ADMIN), async (_, res) => {
    const orders = await Order.find().sort({ _id: -1 })

    res.json(orders)
})

router.get('/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    const order = (await getOrderById(req.params._id))[0]

    res.json(order)
})

router.put('/cancel/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    await cancelOrderSchema.validateAsync(req.body)
    const order = await updateOrderStatus(req.params._id, OrderStatus.CANCELED, req.body.message)

    // TODO PUSH NOTIFICATION
    sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz siparis, ${req.body.message} nedeniyle iptal edilmistir. Odemeniz en kisa surede hesabiniza geri aktarilacaktır. Anlayisiniz için tesekkurler.`)
    res.json(order)
})

router.put('/confirm/:_id', validateAuthority(Authority.ADMIN), async (req, res, next) => {
    await confirmOrderSchema.validateAsync(req.body)
    const order = await updateOrderStatus(req.params._id, OrderStatus.APPROVED, req.body.message)

    // TODO PUSH NOTIFICATION
    sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz siparis, Yurtici Kargoya verilmistir, Kargo takip numarası : ${req.body.message}`)
    res.json(order)
})

router.put('/cancel-return/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    await cancelReturnSchema.validateAsync(req.body)
    const order = await updateOrderStatus(req.params._id, OrderStatus.RETURN_DENIED, req.body.message)

    // TODO PUSH NOTIFICATION
    sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz iade talebi, ${req.body.message} nedeniyle reddedilmistir edilmistir. Anlayisiniz icin tesekkurler.`) // TODO PUSH NOTIFICATION
    res.json(order)
})

router.put('/accept-return/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    await confirmReturnSchema.validateAsync(req.body)
    const order = await updateOrderStatus(req.params._id, OrderStatus.RETURN_ACCEPTED)

    // TODO PUSH NOTIFICATION
    sendSms(`9${order.phoneNumber.split(' ').join('')}`, `${getLocalDate(order.date)} Tarihinde verdiginiz iade talebi onaylanmistir. Iade en kisa sure icerisinde hesabiniza aktarilacaktir.`) // TODO PUSH NOTIFICATION
    res.json(order)
})

export default router