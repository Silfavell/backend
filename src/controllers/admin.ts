import { Router } from 'express'
import path from 'path'

import {
	Manager,
	Admin
} from '../models'

import { validateAuthority } from '../middlewares/auth-middleware'
import Authority from '../enums/authority-enum'
import { createToken, handleError } from '../services/unauthorized'

import {
	validatePostProduct,
	validateUpdateProduct,
	validatePostCategory,
	validateUpdateCategory
} from '../validators/admin-validator'

import {
	saveProductToDatabase,
	saveProductToCache,
	deleteProductFromCache,
	updateProduct,
	deleteProductFromDatabase,
	updateCategory,
	saveCategoryToCache,
	saveCategoryToDatabase,
	deleteCategoryFromDatabase,
	verifyManager,
	indexProduct
} from '../services/admin'

const router = Router()

router.use(validateAuthority(Authority.ANONIM)) // TODO

router.get('/log', (req, res) => {
	const file = path.join(__dirname, `../../logs/info/${new Date().toLocaleDateString('tr', { day: '2-digit', month: '2-digit', year: 'numeric' })}.log`)
	res.download(file)
})

router.get('/error-log', (req, res) => {
	const file = path.join(__dirname, `../../logs/error/${new Date().toLocaleDateString('tr', { day: '2-digit', month: '2-digit', year: 'numeric' })}.log`)
	res.download(file)
})

router.post('/save', (req, res) => {
	new Admin(req.body).save()
		.then((admin) => createToken(admin))
		.then((token) => {
			res.end(token)
		})
})

router.get('/manager-requests', (req, res) => {
	Manager.find({ verified: false }).then((managers) => {
		res.json(managers)
	})
})

router.get('/managers', (req, res) => {
	Manager.find().then((managers) => {
		res.json(managers)
	})
})

router.put('/verify-manager/:_id', (req, res) => {
	verifyManager(req.params._id).then((manager) => {
		res.json(manager)
	})
})

router.post('/category', (req, res, next) => {
	validatePostCategory(req.body)
		.then(() => saveCategoryToDatabase(req.body))
		.then((category) => saveCategoryToCache().then(() => category))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/category'))
		})
})

router.delete('/category/:_id', (req, res, next) => {
	deleteCategoryFromDatabase(req.params._id)
		.then((category) => saveCategoryToCache().then(() => category))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/category'))
		})
})

router.put('/category/:_id', (req, res, next) => {
	validateUpdateCategory(req.body)
		.then(() => updateCategory(req.params._id, req.body))
		.then((category) => saveCategoryToCache().then(() => category))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/category/:_id'))
		})
})

router.post('/product', (req, res, next) => {
	validatePostProduct(req.body)
		.then(() => saveProductToDatabase(req.body))
		.then((product) => saveProductToCache(product))
		.then((product) => indexProduct(product))
		.then((product) => {
			res.json(product)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/product'))
		})
})

router.put('/product/:_id', (req, res, next) => {
	validateUpdateProduct(req.body)
		.then(() => updateProduct(req.params._id, req.body))
		.then((product) => saveProductToCache(product))
		.then((product) => {
			res.json(product)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/product/:_id'))
		})
})

router.delete('/product/:_id', (req, res, next) => {
	deleteProductFromDatabase(req.params._id)
		.then((product) => deleteProductFromCache(product))
		.then(() => {
			res.json()
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/product/:_id'))
		})
})

export default router