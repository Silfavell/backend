/**
 * /types endpoint
 */

import { Router } from 'express'

import {
	saveTypeSchema,
	updateTypeSchema,
	deleteTypeSchema
} from './type.validator'

import {
	saveType,
	updateType,
	deleteType,
	getTypes,
	isTypeSlugExists
} from './type.service'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { getSeoUrl } from '../../utils/seo-url'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/', async (req, res, next) => {
	try {
		const types = await getTypes()

		res.json(types)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/', async (req, res, next) => {
	try {
		await saveTypeSchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isTypeSlugExists(slug)
		const type = await saveType({ ...req.body, slug })

		res.json(type)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/:_id', async (req, res, next) => {
	try {
		await updateTypeSchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isTypeSlugExists(slug, req.params._id)
		const type = await updateType(req.params._id, { ...req.body, slug })

		res.json(type)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.delete('/:_id', async (req, res, next) => {
	try {
		await deleteTypeSchema.validateAsync(req.params)
		const type = await deleteType(req.params._id)

		res.json(type)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})


export default router