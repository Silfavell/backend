import { Router } from 'express'

import {
    deleteSubCategorySchema,
    categorySchema,
    saveSubCategorySchema,
    updateSubCategorySchema
} from './category.validator'
import {
    getCategories,
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

const router = Router()

router.get('/', async (_, res) => {
    const categories = await getCategories()

    res.json(categories)
})

router.post('/category', validateAuthority(Authority.ADMIN), async (req, res) => {
    await categorySchema.validateAsync(req.body)
    const slug = getSeoUrl(req.body.name)
    await isCategorySlugExists(slug)
    const category = await saveCategoryToDatabase({ ...req.body, slug })

    res.json(category)
})

router.delete('/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    const category = await deleteCategoryFromDatabase(req.params._id)

    res.json(category)
})

router.put('/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    await categorySchema.validateAsync(req.body)
    const slug = getSeoUrl(req.body.name)
    await isCategorySlugExists(slug, req.params._id)
    const category = await updateCategory(req.params._id, { ...req.body, slug })

    res.json(category)
})

router.post('/sub-category', validateAuthority(Authority.ADMIN), async (req, res) => {
    await saveSubCategorySchema.validateAsync(req.body)
    const slug = getSeoUrl(req.body.name)
    await isSubCategorySlugExists(req.body, slug)
    const category = await saveSubCategoryToDatabase({ ...req.body, slug })

    res.json(category)
})

router.delete('/sub-category/:parentCategoryId/:_id', validateAuthority(Authority.ADMIN), async (req, res) => {
    await deleteSubCategorySchema.validateAsync(req.params)
    const category = await deleteSubCategoryFromDatabase(req.query)

    res.json(category)
})

router.put('/sub-category', validateAuthority(Authority.ADMIN), async (req, res) => {
    await updateSubCategorySchema.validateAsync(req.body)
    const slug = getSeoUrl(req.body.name)
    await isSubCategorySlugExists(req.body, slug)
    const category = await updateSubCategory(req.body, slug)

    res.json(category)
})


export default router