import Joi from '@hapi/joi'
import HttpStatusCodes from 'http-status-codes'

import { ProductDocument } from '../../models'
import ErrorMessages from '../../errors/ErrorMessages'
import ServerError from '../../errors/ServerError'

export const validateProductIds = async (body: any) => {
    const productIds = body.map((product: any) => product._id)
    const regex = new RegExp('^[0-9a-fA-F]{24}$')

    if (!productIds.every((productId: any) => regex.test(productId))) {
        throw new ServerError(ErrorMessages.UNKNOWN_OBJECT_ID, HttpStatusCodes.BAD_REQUEST, ErrorMessages.UNKNOWN_OBJECT_ID, false)
    }
    
    return
}

export const validateProducts = (products: ProductDocument[]) => Joi.array().min(1).items(productSchema).sparse(false).validateAsync(products)

export const productSchema = Joi.object({
    _id: Joi.string().required(),
    quantity: Joi.number().min(1).required()
})