import { Router } from 'express'
import { validateDeleteSubCategory, validatePostCategory, validatePostSubCategory, validateUpdateCategory, validateUpdateSubCategory } from '../../validators/admin-validator'
import { deleteCategoryFromDatabase, deleteSubCategoryFromDatabase, getSeoUrl, isCategorySlugExists, isSubCategorySlugExists, saveCategoryToDatabase, saveSubCategoryToDatabase, updateCategory, updateSubCategory } from '../../services/admin'

import {
    getCategories
} from '../../services/unauthorized'

const router = Router()

router.get('/', async (_, res) => {
    const categories = await getCategories()

    res.json(categories)
})

router.post('/category', async (req, res) => {
    await validatePostCategory(req.body)
    const slug = getSeoUrl(req.body.name)
    await isCategorySlugExists(slug)
    const category = await saveCategoryToDatabase({ ...req.body, slug })

    res.json(category)
})

router.delete('/:_id', async (req, res) => {
    const category = await deleteCategoryFromDatabase(req.params._id)

    res.json(category)
})

router.put('/:_id', async (req, res) => {
    await validateUpdateCategory(req.body)
    const slug = getSeoUrl(req.body.name)
    await isCategorySlugExists(slug, req.params._id)
    const category = await updateCategory(req.params._id, { ...req.body, slug })

    res.json(category)
})

router.post('/sub-category', async (req, res) => {
    await validatePostSubCategory(req.body)
    const slug = getSeoUrl(req.body.name)
    await isSubCategorySlugExists(req.body, slug)
    const category = await saveSubCategoryToDatabase({ ...req.body, slug })

    res.json(category)
})

router.delete('/sub-category/:parentCategoryId/:_id', async (req, res) => {
    await validateDeleteSubCategory(req.params)
    const category = await deleteSubCategoryFromDatabase(req.query)

    res.json(category)
})

router.put('/sub-category', async (req, res) => {
    await validateUpdateSubCategory(req.body)
    const slug = getSeoUrl(req.body.name)
    await isSubCategorySlugExists(req.body, slug)
    const category = await updateSubCategory(req.body, slug)

    res.json(category)
})


export default router