import mongoose from 'mongoose'
import HttpStatusCodes from 'http-status-codes'
import Iyzipay from 'iyzipay'

import PaymentProvider from '../card/utils/payment-provider'
import OrderStatus from '../../enums/order-status-enum'
import { Cart, Order, Product, ProductDocument, ProductVariables, UserDocument } from '../../models'
import ServerError from '../../errors/ServerError'
import ErrorMessages from '../../errors/ErrorMessages'

export const returnItems = (orderId: string, returnItems: any[]) => (
    Order.findByIdAndUpdate(orderId, { returnItems, status: OrderStatus.RETURNED }, { new: true })
)

export const getOrderById = (orderId: string) => (
    Order.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(orderId)
            }
        },
        {
            $unwind: {
                path: '$returnItems',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                returnQuantity: '$returnItems.quantity'
            }
        },
        {
            $lookup: {
                from: Product.collection.name,
                localField: 'returnItems._id',
                foreignField: '_id',
                as: 'returnItems'
            }
        },
        {
            $addFields: {
                returnItems: {
                    $arrayElemAt: ['$returnItems', 0]
                }
            }
        },
        {
            $addFields: {
                currentProduct: {
                    $filter: {
                        input: '$products',
                        as: 'product',
                        cond: {
                            $eq: ['$$product._id', '$returnItems._id']
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                currentProduct: {
                    $arrayElemAt: ['$currentProduct', 0]
                }
            }
        },
        {
            $addFields: {
                returnItems: {
                    quantity: '$returnQuantity',
                    paidPrice: '$currentProduct.paidPrice'
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                status: { $first: '$status' },
                date: { $first: '$date' },
                customer: { $first: '$customer' },
                address: { $first: '$address' },
                message: { $first: '$message' },
                paidPrice: { $first: '$paidPrice' },
                cargoPrice: { $first: '$cargoPrice' },
                products: { $first: '$products' },
                returnItemsTotalPayback: {
                    $sum: {
                        $multiply: ['$returnItems.paidPrice', '$returnItems.quantity']
                    }
                },
                returnItems: {
                    $push: '$returnItems'
                }
            }
        },
        {
            $addFields: {
                returnItems: {
                    $filter: {
                        input: '$returnItems',
                        as: 'returnItem',
                        cond: {
                            $gt: ['$$returnItem._id', null]
                        }
                    }
                }
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ])
)

export const clearCart = (userId: string) => (
    Cart.deleteOne({ userId })
)

export const createCart = (body: { _id: string, quantity: number }[]) => {
    const productIds = body.map((product) => product._id)

    return Product.find().where('_id').in(productIds).then((products: ProductDocument[]) => (
        products.reduce((json, product, index) => {
            if (!product) {
                throw new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false)
            }

            return Object.assign(json, {
                // eslint-disable-next-line security/detect-object-injection
                [product._id.toString()]: Object.assign(product.toObject(), { quantity: body[index].quantity, paidPrice: product.discountedPrice ?? product.price })
            })
        }, {})
    ))
}

export const checkMakeOrderValues = (user: UserDocument, context: any) => {
    const selectedAddress = user.addresses.find((address) => address._id.toString() === context.address)

    return Cart.findOne({ userId: user._id.toString() }).then((cartObj) => {
        if (!cartObj || !(cartObj.cart.length > 0)) {
            throw new ServerError(ErrorMessages.EMPTY_CART, HttpStatusCodes.BAD_REQUEST, ErrorMessages.EMPTY_CART, false)
        } else if (!selectedAddress) {
            throw new ServerError(ErrorMessages.NO_ADDRESS, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NO_ADDRESS, false)
        } else {
            return createCart(cartObj.cart).then((cart) => {
                return ({ cart, selectedAddress, card: context.card })
            })
        }
    })
}

export const createPaymentWithRegisteredCard = (user: UserDocument, price: number, cargoPrice: number, basketItems: any[], address: string, cardToken: string) => (
    new Promise((resolve, reject) => {
        const request = {
            locale: Iyzipay.LOCALE.TR,
            // conversationId: '123456789',
            price: price.toFixed(2),
            paidPrice: (price + cargoPrice).toFixed(2),
            currency: Iyzipay.CURRENCY.TRY,
            installment: '1',
            basketId: 'B67832',
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            paymentCard: {
                cardUserKey: user.cardUserKey,
                cardToken
            },
            buyer: {
                id: user._id.toString(),
                name: user.nameSurname,
                surname: user.nameSurname,
                gsmNumber: user.phoneNumber,
                email: user.email,
                identityNumber: '11111111111',
                //	lastLoginDate: '2020-04-15 10:12:35',
                //	registrationDate: '2020-04-15 10:12:09',
                registrationAddress: address,
                // ip: '85.34.78.112',
                city: 'Istanbul',
                country: 'Turkey',
                // zipCode: '34732'
            },
            shippingAddress: {
                contactName: user.nameSurname,
                city: 'Istanbul',
                country: 'Turkey',
                address,
                // zipCode: '34742'
            },
            billingAddress: {
                contactName: user.nameSurname,
                city: 'Istanbul',
                country: 'Turkey',
                address,
                // zipCode: '34742'
            },
            basketItems
        }

        PaymentProvider.getClient().payment.create(request, (error: any, result: any) => {
            if (error) {
                reject(error)
            } if (result.status === 'failure') {
                reject(new ServerError(ErrorMessages.UNEXPECTED_ERROR, HttpStatusCodes.INTERNAL_SERVER_ERROR, result.errorMessage, true))
            }
            resolve(result)
        })
    })
)

export const completePayment = (user: UserDocument, cart: any, address: string, cardToken: string) => {
    const paidPrice = Object.values(cart).reduce((previousValue: number, currentValue: any) => previousValue + (currentValue.price * currentValue.quantity), 0) as number
    const cargoPrice = paidPrice < 85 ? 15 : 0

    return createPaymentWithRegisteredCard(
        user,
        paidPrice,
        cargoPrice,
        Object.values(cart).map(({
            _id,
            name,
            price,
            quantity
        }) => ({
            id: _id.toString(),
            name,
            price: (price * quantity).toFixed(2).toString(),
            category1: 'product',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL
        })),
        address,
        cardToken
    )
}

export const getAllOrders = () => {
    return Order.find().sort({ _id: -1 })
}

export const getOrders = (phoneNumber: string) => (
    Order.aggregate([
        {
            $match: {
                phoneNumber
            }
        },
        {
            $unwind: {
                path: '$returnItems',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                returnQuantity: '$returnItems.quantity'
            }
        },
        {
            $lookup: {
                from: Product.collection.name,
                localField: 'returnItems._id',
                foreignField: '_id',
                as: 'returnItems'
            }
        },
        {
            $addFields: {
                returnItems: {
                    $arrayElemAt: ['$returnItems', 0]
                }
            }
        },
        {
            $addFields: {
                currentProduct: {
                    $filter: {
                        input: '$products',
                        as: 'product',
                        cond: {
                            $eq: ['$$product._id', '$returnItems._id']
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                currentProduct: {
                    $arrayElemAt: ['$currentProduct', 0]
                }
            }
        },
        {
            $addFields: {
                returnItems: {
                    quantity: '$returnQuantity',
                    paidPrice: '$currentProduct.paidPrice'
                }
            }
        },
        {
            $group: {
                _id: '$_id',
                status: { $first: '$status' },
                date: { $first: '$date' },
                message: { $first: '$message' },
                paidPrice: { $first: '$paidPrice' },
                cargoPrice: { $first: '$cargoPrice' },
                products: { $first: '$products' },
                returnItemsTotalPayback: {
                    $sum: {
                        $multiply: ['$returnItems.paidPrice', '$returnItems.quantity']
                    }
                },
                returnItems: {
                    $push: '$returnItems'
                }
            }
        },
        {
            $addFields: {
                returnItems: {
                    $filter: {
                        input: '$returnItems',
                        as: 'returnItem',
                        cond: {
                            $gt: ['$$returnItem._id', null]
                        }
                    }
                }
            }
        },
        {
            $sort: {
                _id: -1
            }
        }
    ])
)

export const saveOrderToDatabase = (user: UserDocument, cart: any, address: any) => {
    const paidPrice = Object.values(cart).reduce((previousValue: number, currentValue: any) => previousValue + parseFloat(currentValue.discountedPrice || currentValue.price) * currentValue.quantity, 0) as number

    return new Order({
        customer: user.nameSurname,
        phoneNumber: user.phoneNumber,
        address: address.openAddress,
        products: Object.values(cart),
        paidPrice: paidPrice.toFixed(2),
        cargoPrice: paidPrice < 85 ? 15 : 0
    }).save()
}

export const updateProductsSoldTimes = (cart: any) => {
    const updates = Object.values(cart).map((cartProduct: any) => (
        ProductVariables.findOneAndUpdate({ productId: cartProduct._id }, { $inc: { timesSold: cartProduct.quantity } })
    ))

    return Promise.all(updates)
}

export const updateOrderStatus = (orderId: string, status: number, message?: string) => {
    switch (status) {
        case OrderStatus.APPROVED:
        case OrderStatus.CANCELED:
        case OrderStatus.RETURN_DENIED: return Order.findByIdAndUpdate(orderId, { status, message }, { new: true })
        default: return Order.findByIdAndUpdate(orderId, { status }, { new: true })
    }
}