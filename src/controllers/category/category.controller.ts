import { Router } from 'express'

import {
	deleteSubCategorySchema,
	categorySchema,
	saveSubCategorySchema,
	updateSubCategorySchema
} from './category.validator'

import {
	getCategories,
	getCategoriesAsMap,
	deleteCategoryFromDatabase,
	deleteSubCategoryFromDatabase,
	isCategorySlugExists,
	isSubCategorySlugExists,
	saveCategoryToDatabase,
	saveSubCategoryToDatabase,
	updateCategory,
	updateSubCategory
} from './category.service'

import { getSeoUrl } from '../../utils/seo-url'
import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'
import { handleError } from '../../utils/handle-error'
import { constant } from 'lodash'

const router = Router()

router.get('/', async (req, res, next) => {
	try {
		const categories = await getCategories()

		res.json(categories)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.get('/as-map', async (req, res, next) => {
	try {
		const categories = await getCategoriesAsMap(req.query.noFilter)

		res.json(categories)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await categorySchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isCategorySlugExists(slug)
		const category = await saveCategoryToDatabase({ ...req.body, slug })

		res.json(category)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.post('/sub-category', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await saveSubCategorySchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isSubCategorySlugExists(req.body, slug)
		const category = await saveSubCategoryToDatabase({ ...req.body, slug })

		res.json(category)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.delete('/sub-category/:parentCategoryId/:_id', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await deleteSubCategorySchema.validateAsync(req.params)
		const category = await deleteSubCategoryFromDatabase(req.query)

		res.json(category)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/sub-category', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await updateSubCategorySchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isSubCategorySlugExists(req.body, slug)
		const category = await updateSubCategory(req.body, slug)

		res.json(category)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})


router.delete('/:_id', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		const category = await deleteCategoryFromDatabase(req.params._id)

		res.json(category)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

router.put('/:_id', validateAuthority(Authority.ADMIN), async (req, res, next) => {
	try {
		await categorySchema.validateAsync(req.body)
		const slug = getSeoUrl(req.body.name)
		await isCategorySlugExists(slug, req.params._id)
		const category = await updateCategory(req.params._id, { ...req.body, slug })

		res.json(category)
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router