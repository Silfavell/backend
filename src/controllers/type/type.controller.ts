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

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/', async (_, res) => {
    const types = await getTypes()

    res.json(types)
})

router.post('/', async (req, res) => {
    await saveTypeSchema.validateAsync(req.body)
    const slug = await getSeoUrl(req.body.name)
    await isTypeSlugExists(slug)
    const type = await saveType({ ...req.body, slug })

    res.json(type)
})

router.put('/:_id', async (req, res) => {
    await updateTypeSchema.validateAsync(req.body)
    const slug = await getSeoUrl(req.body.name)
    await isTypeSlugExists(slug)
    const type = await updateType(req.params._id, { ...req.body, slug })

    res.json(type)
})

router.delete('/:_id', async (req, res) => {
    await deleteTypeSchema.validateAsync(req.params)
    const type = await deleteType(req.params._id)

    res.json(type)
})


export default router