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
	validateUpdateSubCategory,
	validatePostSubCategory,
	validateDeleteSubCategory,
	validateSaveTypeRequest,
	validateUpdateTypeRequest
} from '../validators/admin-validator'

import {
	getTickets,
	saveProductToDatabase,
	updateProduct,
	deleteProductFromDatabase,
	updateCategory,
	updateSubCategory,
	saveCategoryToDatabase,
	deleteCategoryFromDatabase,
	verifyManager,
	unverifyManager,
	deleteManager,
	indexProduct,
	saveSubCategoryToDatabase,
	deleteSubCategoryFromDatabase,
	updateCategoryOfProduct,
	saveProductImages,
	removeProductFromSearch,
	getSeoUrl,
	isProductSlugExists,
	isCategorySlugExists,
	isSubCategorySlugExists,
	saveType,
	updateType,
	getWaitingComments,
	verifyComment,
	deleteComment,
	getTypes,
	isTypeSlugExists
} from '../services/admin'

import { validateObjectId } from './../services/unauthorized'

const router = Router()

router.use(fileUpload({
	createParentPath: true
}))
router.use(validateAuthority(Authority.ADMIN))

router.get('/test', (req, res) => {
	res.json({ status: true })
})

router.get('/tickets', (req, res, next) => {
	getTickets()
		.then((tickets) => {
			res.json(tickets)
		}).catch((reason) => {
			next(handleError(reason, 'GET /admin/tickets'))
		})
})

router.get('/log', (req, res) => {
	if (process.platform === 'win32') {
		const date = new Date().toLocaleDateString('tr', { day: '2-digit', month: '2-digit', year: 'numeric' })
		const file = path.join(__dirname, `../../logs/info/${date}.log`)
		res.download(file)
	} else {
		const date = new Date()
		const year = date.getFullYear().toString()
		const month = ('0' + (date.getMonth() + 1)).slice(-2)
		const day = ('0' + date.getDate()).slice(-2)

		const file = path.join(__dirname, `../../logs/info/${year}-${month}-${day}.log`)
		res.download(file)
	}
})

router.get('/error-log', (req, res) => {
	if (process.platform === 'win32') {
		const date = new Date().toLocaleDateString('tr', { day: '2-digit', month: '2-digit', year: 'numeric' })
		const file = path.join(__dirname, `../../logs/error/${date}.log`)
		res.download(file)
	} else {
		const date = new Date()
		const year = date.getFullYear().toString()
		const month = ('0' + (date.getMonth() + 1)).slice(-2)
		const day = ('0' + date.getDate()).slice(-2)

		const file = path.join(__dirname, `../../logs/error/${year}-${month}-${day}.log`)
		res.download(file)
	}
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

router.put('/unverify-manager/:_id', (req, res, next) => {
	unverifyManager(req.params._id)
		.then((manager) => {
			res.json(manager)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/unverify-manager/:_id'))
		})
})

router.delete('/delete-manager/:_id', (req, res, next) => {
	deleteManager(req.params._id)
		.then((manager) => {
			res.json(manager)
		})
		.catch((reason) => {
			next(handleError(reason, 'DELETE /admin/delete-manager/:_id'))
		})
})

router.post('/category', (req, res, next) => {
	validatePostCategory(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isCategorySlugExists(slug))
		.then((slug) => saveCategoryToDatabase({ ...req.body, slug }))
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
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isSubCategorySlugExists(req.body, slug))
		.then((slug) => saveSubCategoryToDatabase({ ...req.body, slug }))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/sub-category'))
		})
})

router.delete('/sub-category', (req, res, next) => {
	validateDeleteSubCategory(req.query)
		.then(() => deleteSubCategoryFromDatabase(req.query))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'DELETE /admin/sub-category'))
		})
})

router.put('/category/:_id', (req, res, next) => {
	validateUpdateCategory(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isCategorySlugExists(slug, req.params._id))
		.then((slug) => updateCategory(req.params._id, { ...req.body, slug }))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/category/:_id'))
		})
})

router.put('/sub-category', (req, res, next) => {
	validateUpdateSubCategory(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isSubCategorySlugExists(req.body, slug))
		.then((slug) => updateSubCategory(req.body, slug))
		.then((category) => {
			res.json(category)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/sub-category'))
		})
})

router.post('/product', (req, res, next) => {
	if (req.files?.images) {
		if (!Array.isArray(req.files.images)) {
			req.files.images = [req.files.images]
		}
		req.body.imageCount = Object.keys(req.files.images).length
	}

	if (req.body.color) {
		req.body.color = JSON.parse(req.body.color)
	}

	if (req.body.purchasable) {
		req.body.purchasable = req.body.purchasable === 'true'
	}

	if (req.body.specifications) {
		req.body.specifications = JSON.parse(req.body.specifications)

		req.body.specifications = req.body.specifications.map((spec: any) => ({
			...spec,
			slug: getSeoUrl(spec.name)
		}))
	}

	validatePostProduct(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isProductSlugExists(slug))
		.then((slug) => saveProductToDatabase({ ...req.body, slug }))
		.then((product) => updateCategoryOfProduct(product))
		.then((product) => indexProduct(product).then(() => product))
		.then((product) => {
			if (req.files?.images) {
				saveProductImages(product, Object.values(req.files.images))
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

	if (req.body.specifications) {
		req.body.specifications = JSON.parse(req.body.specifications)

		req.body.specifications = req.body.specifications.map((spec: any) => ({
			...spec,
			slug: getSeoUrl(spec.name)
		}))
	}

	validateUpdateProduct(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isProductSlugExists(slug, req.params._id))
		.then((slug) => updateProduct(req.params._id, req.body, slug))
		.then((product) => indexProduct(product).then(() => product))
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

/*
	router.delete('/product/:_id', (req, res, next) => {
		validateObjectId(req.params._id)
			.then(() => deleteProductFromDatabase(req.params._id))
			.then((product) => removeProductFromSearch(product))
			.then(() => {
				res.json()
			})
			.catch((reason) => {
				next(handleError(reason, 'DELETE /admin/product/:_id'))
			})
	})
*/

router.get('/types', (req, res, next) => {
	getTypes()
		.then((types) => {
			res.json(types)
		})
		.catch((reason) => {
			next(handleError(reason, 'GET /admin/types'))
		})
})


router.post('/save-type', (req, res, next) => {
	validateSaveTypeRequest(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isTypeSlugExists(slug))
		.then((slug) => saveType({ ...req.body, slug }))
		.then((type) => {
			res.json(type)
		})
		.catch((reason) => {
			next(handleError(reason, 'POST /admin/save-type'))
		})
})

router.put('/update-type/:_id', (req, res, next) => {
	validateUpdateTypeRequest(req.body)
		.then(() => getSeoUrl(req.body.name))
		.then((slug) => isTypeSlugExists(slug, req.params._id))
		.then((slug) => updateType(req.params._id, { ...req.body, slug }))
		.then((type) => {
			res.json(type)
		})
		.catch((reason) => {
			next(handleError(reason, 'PUT /admin/update-type/:_id'))
		})
})

router.get('/waiting-comments', (req, res, next) => {
	getWaitingComments().then((comments) => {
		res.json(comments)
	}).catch((reason) => {
		next(handleError(reason, 'GET /admin/waiting-comments'))
	})
})

router.put('/verify-comment/:_id', (req, res, next) => {
	verifyComment(req.params._id).then((comment) => {
		res.json(comment)
	}).catch((reason) => {
		next(handleError(reason, 'PUT /admin/verify-comment/:_id'))
	})
})

router.delete('/delete-comment/:_id', (req, res, next) => {
	deleteComment(req.params._id).then((comment) => {
		res.json(comment)
	}).catch((reason) => {
		next(handleError(reason, 'DELETE /admin/delete-comment/:_id'))
	})
})

export default router