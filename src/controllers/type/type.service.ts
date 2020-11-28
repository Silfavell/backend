import HttpStatusCodes from 'http-status-codes'

import ErrorMessages from '../../errors/ErrorMessages'
import ServerError from '../../errors/ServerError'
import { ProductType, ProductTypeDocument } from '../../models'

export const isTypeSlugExists = (slug: string, updateId?: string) => (
	ProductType.findOne({ slug }).then((type) => {
		if (type && updateId !== type._id.toString()) {
			throw new ServerError(ErrorMessages.ANOTHER_TYPE_WITH_THE_SAME_NAME, HttpStatusCodes.BAD_REQUEST, ErrorMessages.ANOTHER_TYPE_WITH_THE_SAME_NAME, false)
		}

		return slug
	})
)

export const saveType = (body: ProductTypeDocument) => (
	new ProductType(body).save()
)

export const updateType = (id: string, body: ProductTypeDocument) => (
	ProductType.findByIdAndUpdate(id, body, { new: true })
)

export const deleteType = async (id: string) => {
	const type = await ProductType.findById(id)

	return await type.remove()
}

export const getTypes = () => (
	ProductType.find()
)