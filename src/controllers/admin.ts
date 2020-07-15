import { Router } from 'express'
import path from 'path'
import fileUpload from 'express-fileupload'

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
	validateUpdateCategory,
	validatePostSubCategory,
	validateDeleteSubCategory
} from '../validators/admin-validator'

import {
	saveProductToDatabase,
	updateProduct,
	deleteProductFromDatabase,
	updateCategory,
	saveCategoryToDatabase,
	deleteCategoryFromDatabase,
	verifyManager,
	indexProduct,
	saveSubCategoryToDatabase,
	deleteSubCategoryFromDatabase,
	updateCategoryOfProduct,
	saveProductImages,
	removeProductFromSearch
} from '../services/admin'

const router = Router()

router.use(fileUpload({
	createParentPath: true
}))
router.use(validateAuthority(Authority.ANONIM))

router.get('/log', (req, res) => {
	const file = path.join(__dirname, `../../logs/info/${new Date().toLocaleDateString('tr', { day: '2-digit', month: '2-digit', year: 'numeric' })}.log`)
	res.download(file)
})

router.get('/error-log', (req, res) => {
	const file = path.join(__dirname, `../../logs/error/${new Date().toLocaleDateString('tr', { day: '2-digit', month: '2-digit', year: 'numeric' })}.log`)
	res.download(file)
})

router.post('/save', (req, res, next) => {
	new Admin(req.body).save()
		.then((admin) => createToken(admin))
		.then((token) => {
			res.end(token)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/save'))
		})
})

router.get('/manager-requests', (req, res, next) => {
	Manager.find({ verified: false })
		.then((managers) => {
			res.json(managers)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /admin/manager-requests'))
		})
})

router.get('/managers', (req, res, next) => {
	Manager.find()
		.then((managers) => {
			res.json(managers)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /admin/managers'))
		})
})

router.put('/verify-manager/:_id', (req, res, next) => {
	verifyManager(req.params._id)
		.then((manager) => {
			res.json(manager)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/verify-manager/:_id'))
		})
})

router.post('/category', (req, res, next) => {
	validatePostCategory(req.body)
		.then(() => saveCategoryToDatabase(req.body))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/category'))
		})
})

router.delete('/category/:_id', (req, res, next) => {
	deleteCategoryFromDatabase(req.params._id)
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'DELETE /admin/category'))
		})
})

router.post('/sub-category', (req, res, next) => {
	validatePostSubCategory(req.body)
		.then(() => saveSubCategoryToDatabase(req.body))
		.then((category: any) => {
			res.json(category)
		})
		.catch((reason: any) => {
			next(handleError(reason, 'POST /admin/sub-category'))
		})
})

router.delete('/sub-category', (req, res, next) => {
	validateDeleteSubCategory(req.body)
		.then(() => deleteSubCategoryFromDatabase(req.body))
		.then((category: any) => {
			res.json(category)
		})
		.catch((reason: any) => {
			next(handleError(reason, 'DELETE /admin/sub-category'))
		})
})

router.put('/category/:_id', (req, res, next) => {
	validateUpdateCategory(req.body)
		.then(() => updateCategory(req.params._id, req.body))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/category/:_id'))
		})
})

router.post('/product', (req, res, next) => {
	if (req.files) {
		req.body.imageCount = Object.keys(req.files).length
	}

	if (req.body.color) {
		req.body.color = JSON.parse(req.body.color)
	}

	validatePostProduct(req.body)
		.then(() => saveProductToDatabase(req.body))
		.then((product) => updateCategoryOfProduct(product))
		.then((product) => indexProduct(product).then(() => product))
		.then((product) => {
			if (req.files) {
				saveProductImages(product, Object.values(req.files))
			}
			res.json(product)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/product'))
		})
})

router.put('/product/:_id', (req, res, next) => {
	if (req.files) {
		req.body.imageCount = Object.keys(req.files).length
	}

	if (req.body.color) {
		req.body.color = JSON.parse(req.body.color)
	}

	validateUpdateProduct(req.body)
		.then(() => updateProduct(req.params._id, req.body))
		.then((product: any) => indexProduct(product).then(() => product))
		.then((product) => {
			if (req.files) {
				saveProductImages(product, Object.values(req.files))
			}

			res.json(product)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/product/:_id'))
		})
})

router.delete('/product/:_id', (req, res, next) => {
	deleteProductFromDatabase(req.params._id)
		.then((product: any) => removeProductFromSearch(product))
		.then(() => {
			res.json()
		})
		.catch((reason) => {
			next(handleError(reason, 'DELETE /admin/product/:_id'))
		})
})

export default router