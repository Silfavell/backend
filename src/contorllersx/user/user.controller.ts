import { Router } from 'express'

import {
    changePassword,
    updateUser,
    deleteAddress,
    getFavoriteProductsFromDatabase,
    saveFavoriteProductToDatabase,
    removeFavoriteProductFromDatabase,
    saveAddressToDatabase,
    updatePhoneNumber
} from './user.service'

import {
    compareActivationCode,
    comparePasswords,
    getActivationCode,
    isUserExists
} from '../auth/auth.validator'

import {
    updateProfileSchema,
    saveAddressSchema,
    changePasswordSchema,
    updatePhoneNumberSchema,
    favoriteProductSchema
} from './user.validator'
import ActivationCodes from '../../enums/activation-code-enum'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

const router = Router()

router.use(validateAuthority(Authority.USER))

router.get('/profile', async (req, res) => {
    const user = await isUserExists(req.user.phoneNumber)

    res.json(user)
})

router.put('/profile', async (req, res) => {
    await updateProfileSchema.validateAsync(req.body)
    const user = await updateUser(req.user._id, req.body)

    res.json(user)
})

router.post('/address', async (req, res) => {
    await saveAddressSchema.validateAsync(req.body)
    const user = await saveAddressToDatabase(req.user._id, req.body)

    res.json(user)
})

router.get('/favorite-products', async (req, res) => {
    const favoriteProducts = (await getFavoriteProductsFromDatabase(req.user._id))[0]

    res.json(favoriteProducts)
})

router.post('/favorite-product', async (req, res) => {
    await favoriteProductSchema.validateAsync(req.body)
    const { favoriteProducts } = await saveFavoriteProductToDatabase(req.user._id, req.body)

    res.json(favoriteProducts)
})

router.delete('/favorite-product/:_id', async (req, res) => {
    await favoriteProductSchema.validateAsync(req.params)
    const { favoriteProducts } = await removeFavoriteProductFromDatabase(req.user._id, req.params._id)

    res.json(favoriteProducts)
})

router.delete('/address/:_id', async (req, res) => {
    const user = await deleteAddress(req.user._id, req.params._id)

    res.json(user)
})

router.put('/change-password', async (req, res) => {
    await Promise.all([changePasswordSchema.validateAsync(req.body), comparePasswords(req.user.password, req.body.oldPassword)])
    const user = await isUserExists(req.user.phoneNumber)
    await changePassword(user, req.body.newPassword)

    res.json()
})

router.put('/phone-number', async (req, res) => {
    const { newPhoneNumber } = await updatePhoneNumberSchema.validateAsync(req.body)
    const activationCode = await getActivationCode(newPhoneNumber, ActivationCodes.UPDATE_PHONE_NUMBER)

    await compareActivationCode(req.body.activationCode.toString(), activationCode.toString())
    await updatePhoneNumber(req.user.phoneNumber, newPhoneNumber)
    res.json()
})

export default router