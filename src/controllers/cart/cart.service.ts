import HttpStatusCodes from 'http-status-codes'

import ErrorMessages from '../../errors/ErrorMessages'
import ServerError from '../../errors/ServerError'
import { Product, Cart, ProductDocument } from '../../models'

export const createCart = async (body: { _id: string, quantity: number }[]) => {
    const productIds = body.map((product) => product._id)

    const products = await Product.where('_id').in(productIds).find()

    return products.reduce((json, product, index) => {
        if (!product) {
            throw new ServerError(ErrorMessages.NON_EXISTS_PRODUCT, HttpStatusCodes.BAD_REQUEST, ErrorMessages.NON_EXISTS_PRODUCT, false)
        }

        return Object.assign(json, {
            // eslint-disable-next-line security/detect-object-injection
            [product._id.toString()]: Object.assign(product.toObject(), { quantity: body[index].quantity, paidPrice: product.discountedPrice ?? product.price })
        })
    }, {})
}

export const saveCart = async (userId: string, cart: ProductDocument[]) => {
    const oldCart = await Cart.findOne({ userId })

    if (oldCart) {
        return await oldCart.update({ cart })
    }

    return await new Cart({ userId, cart }).save()
}

export const getCart = async (userId: string) => {
    const oldCart = await Cart.findOne({ userId })
    if (oldCart) {
        return await createCart(oldCart.cart)
    }

    return {}
}

export const clearCart = (userId: string) => (
    Cart.deleteOne({ userId })
)