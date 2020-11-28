import { Router } from 'express'
import {
	getBestSellerMobileProducts,
	getMostSearchedMobileProducts,
	getProductsInCategories
} from '../product/product.service'
import { getCategories } from '../category/category.service'
import { getCart } from '../cart/cart.service'
import { listCards } from '../card/card.service'
import { handleError } from '../../utils/handle-error'

const router = Router()

router.get('/version', (req, res, next) => {
	res.json('1.0.1')
})

router.get('/initialize', async (req, res, next) => {
	try {
		const arr: any = [getCategories(), getProductsInCategories(), getBestSellerMobileProducts(), getMostSearchedMobileProducts()]

		if (req.user) {
			arr.push(
				getCart(req.user._id.toString()),
				listCards(req.user.cardUserKey)
			)
		}

		const [
			categories,
			products,
			bestSeller,
			mostSearched,
			cart,
			cards
		] = await Promise.all(arr)

		if (req.user) {
			res.json({
				categories,
				products,
				bestSeller,
				mostSearched,
				cart,
				cards
			})
		} else {
			res.json({
				categories,
				products,
				bestSeller,
				mostSearched
			})
		}
	} catch (error) {
		next(handleError(error, `${req.protocol}://${req.get('host')}${req.originalUrl}`))
	}
})

export default router