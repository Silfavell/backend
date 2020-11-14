/**
 * /types endpoint
 */

import { Router } from 'express'

import {
    validateSaveTypeRequest,
    validateUpdateTypeRequest,
    validateDeleteTypeRequest
} from '../validators/admin-validator'

import {
    getSeoUrl,
    saveType,
    updateType,
    deleteType,
    getTypes,
    isTypeSlugExists
} from '../services/admin'
import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/', async (_, res) => {
    const types = await getTypes()

    res.json(types)
})

router.post('/', async (req, res) => {
    await validateSaveTypeRequest(req.body)
    const slug = await getSeoUrl(req.body.name)
    await isTypeSlugExists(slug)
    const type = await saveType({ ...req.body, slug })

    res.json(type)
})

router.put('/:_id', async (req, res) => {
    await validateUpdateTypeRequest(req.body)
    const slug = await getSeoUrl(req.body.name)
    await isTypeSlugExists(slug)
    const type = await updateType(req.params._id, { ...req.body, slug })

    res.json(type)
})

router.delete('/:_id', async (req, res) => {
    await validateDeleteTypeRequest(req.params)
    const type = await deleteType(req.params._id)

    res.json(type)
})


export default router