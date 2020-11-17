import { Router } from 'express'
import path from 'path'

import { validateAuthority } from '../../middlewares/auth-middleware'
import Authority from '../../enums/authority-enum'

const router = Router()

router.use(validateAuthority(Authority.ADMIN))

router.get('/log', (req, res, next) => {
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

router.get('/error-log', (req, res, next) => {
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

export default router