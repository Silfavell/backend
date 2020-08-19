import getCartBeforePostCartTests from './get-cart-before-post-cart.test'
import deleteCartTests from './delete-cart.test'
import postOrderTests from './post-order.test'
import postCartTests from './post-cart.test'
import getCartTests from './get-cart.test'
import postAddressTests from './post-address.test'
import deleteAddressTests from './delete-address.test'
import postPaymentCardTests from './post-payment-card.test'
import getListCardsTests from './get-list-cards.test'
import deleteCardTests from './delete-card.test'
import postFavoriteProductTests from './post-favorite-product.test'
import deleteFavoriteProductTests from './delete-favorite-product.test'
import getFavoriteProductsTests from './get-favorite-products.test'
import getOrdersTests from './get-orders.test'
import getOrderByIdTests from './get-order-by-id.test'

export default () => describe('user', () => {
	getCartBeforePostCartTests()
	postAddressTests()
	postFavoriteProductTests()
	getFavoriteProductsTests()
	deleteFavoriteProductTests()
	postPaymentCardTests()
	deleteCardTests()
	getListCardsTests()
	postOrderTests()
	deleteCartTests()
	postCartTests()
	getCartTests()
	getOrdersTests()
	deleteAddressTests()
	getOrderByIdTests()
})